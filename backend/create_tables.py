#!/usr/bin/env python3
"""
Script to create all necessary database tables in a PostgreSQL database for the Prompt Mixer application.
This script is designed to be run independently to initialize the database schema in a production environment.
It automatically detects and creates missing tables or adds missing columns to existing tables.
"""

import os
import sys
import argparse
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Add the parent directory to sys.path to allow importing from the app package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Base class and all models to ensure they're registered with the metadata
from app.core.database import Base

def get_sql_type_string(column):
    """
    Convert SQLAlchemy column type to SQL type string for ALTER TABLE statements.
    
    Args:
        column: SQLAlchemy Column object
        
    Returns:
        str: SQL type string
    """
    # This is a simplified conversion - extend as needed for your column types
    type_str = str(column.type)
    
    if "VARCHAR" in type_str or "String" in type_str:
        # Use a default length of 255 if not specified
        length = getattr(column.type, 'length', None)
        if length is None:
            return "VARCHAR(255)"
        else:
            return f"VARCHAR({length})"
    elif "INTEGER" in type_str:
        return "INTEGER"
    elif "BOOLEAN" in type_str:
        return "BOOLEAN"
    elif "TEXT" in type_str:
        return "TEXT"
    elif "TIMESTAMP" in type_str:
        return "TIMESTAMP WITH TIME ZONE"
    elif "JSON" in type_str:
        return "JSON"
    else:
        # Default to TEXT for unknown types
        print(f"Warning: Unknown column type {type_str} for column {column.name}, using TEXT")
        return "TEXT"

def detect_missing_columns(engine):
    """
    Detect missing columns by comparing model definitions with database schema.
    
    Args:
        engine: SQLAlchemy engine
        
    Returns:
        dict: Dictionary mapping table names to lists of (column, sql_type) tuples
    """
    inspector = inspect(engine)
    missing_columns = {}
    
    # Get all tables defined in the models
    metadata = Base.metadata
    
    for table_name, table in metadata.tables.items():
        # Skip if table doesn't exist in database
        if not inspector.has_table(table_name):
            continue
            
        # Get existing columns in the database
        existing_columns = {c['name'] for c in inspector.get_columns(table_name)}
        
        # Find columns in the model that don't exist in the database
        missing = []
        for column in table.columns:
            if column.name not in existing_columns:
                sql_type = get_sql_type_string(column)
                missing.append((column.name, sql_type, column.nullable))
                
        if missing:
            missing_columns[table_name] = missing
    
    return missing_columns

def add_missing_columns(engine, missing_columns):
    """
    Add missing columns to existing tables.
    
    Args:
        engine: SQLAlchemy engine
        missing_columns (dict): Dictionary mapping table names to lists of (column_name, column_type, nullable) tuples
        
    Returns:
        bool: True if all columns were added successfully, False otherwise
    """
    try:
        with engine.connect() as connection:
            for table_name, columns in missing_columns.items():
                for column_name, column_type, nullable in columns:
                    nullable_str = "" if nullable else "NOT NULL"
                    sql = f'ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type} {nullable_str}'
                    connection.execute(text(sql))
                    print(f"Added column {column_name} to table {table_name}")
        return True
    except SQLAlchemyError as e:
        print(f"Error adding missing columns: {str(e)}")
        return False

def create_tables(database_url, echo=False):
    """
    Create all database tables defined in the SQLAlchemy models.
    If tables already exist, update them with any missing columns.
    
    Args:
        database_url (str): The database connection URL
        echo (bool): Whether to echo SQL statements to stdout
        
    Returns:
        bool: True if tables were created or updated successfully, False otherwise
    """
    try:
        # Create engine with the provided database URL
        engine = create_engine(database_url, echo=echo)
        
        # Create all tables that don't exist yet
        Base.metadata.create_all(bind=engine)
        
        # Check for missing columns in existing tables
        missing_columns = detect_missing_columns(engine)
        
        if missing_columns:
            print(f"Found {sum(len(cols) for cols in missing_columns.values())} missing columns across {len(missing_columns)} tables")
            update_success = add_missing_columns(engine, missing_columns)
            if update_success:
                print("Schema updated successfully.")
            else:
                print("Failed to update schema.")
                return False
        else:
            print("All tables are up to date with the current models.")
        
        # Get list of all tables
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"Database now has {len(tables)} tables:")
        for table in sorted(tables):
            print(f"  - {table}")
            
        return True
    except SQLAlchemyError as e:
        print(f"Error creating/updating tables: {str(e)}")
        return False

def main():
    """
    Main function to parse arguments and create or update database tables.
    """
    # Load environment variables from .env file
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    load_dotenv(env_path)
    
    parser = argparse.ArgumentParser(description='Create or update database tables for Prompt Mixer application')
    parser.add_argument('--db-url', type=str, 
                        help='Database URL (e.g., postgresql://user:password@host:port/dbname)')
    parser.add_argument('--echo', action='store_true', 
                        help='Echo SQL statements to stdout')
    args = parser.parse_args()
    
    # Get database URL from arguments, environment variable, or use default
    database_url = args.db_url or os.getenv("DATABASE_URL")
    
    if not database_url:
        print("Error: Database URL not provided. Use --db-url argument or set DATABASE_URL environment variable.")
        sys.exit(1)
    
    # Check if the URL is for PostgreSQL
    if not database_url.startswith('postgresql://'):
        print("Warning: This script is intended for PostgreSQL databases. Your URL doesn't seem to be for PostgreSQL.")
        response = input("Do you want to continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(0)
    
    print(f"Creating/updating tables in database: {database_url}")
    success = create_tables(database_url, echo=args.echo)
    
    if success:
        print("\nDatabase setup completed successfully!")
    else:
        print("\nDatabase setup failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
