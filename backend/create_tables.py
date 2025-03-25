#!/usr/bin/env python3
"""
Script to create all necessary database tables in a PostgreSQL database for the Prompt Mixer application.
This script is designed to be run independently to initialize the database schema in a production environment.
"""

import os
import sys
import argparse
from sqlalchemy import create_engine, inspect
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Add the parent directory to sys.path to allow importing from the app package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Base class and all models to ensure they're registered with the metadata
from app.core.database import Base
from app.models.models import User, Prompt, Tag, PromptTag, PromptHistory, UserLibrary

def create_tables(database_url, echo=False):
    """
    Create all database tables defined in the SQLAlchemy models.
    
    Args:
        database_url (str): The database connection URL
        echo (bool): Whether to echo SQL statements to stdout
        
    Returns:
        bool: True if tables were created successfully, False otherwise
    """
    try:
        # Create engine with the provided database URL
        engine = create_engine(database_url, echo=echo)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # Get list of created tables
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"Successfully created {len(tables)} tables:")
        for table in sorted(tables):
            print(f"  - {table}")
            
        return True
    except SQLAlchemyError as e:
        print(f"Error creating tables: {str(e)}")
        return False

def main():
    """
    Main function to parse arguments and create database tables.
    """
    # Load environment variables from .env file
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    load_dotenv(env_path)
    
    parser = argparse.ArgumentParser(description='Create database tables for Prompt Mixer application')
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
    
    print(f"Creating tables in database: {database_url}")
    success = create_tables(database_url, echo=args.echo)
    
    if success:
        print("\nDatabase setup completed successfully!")
    else:
        print("\nDatabase setup failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
