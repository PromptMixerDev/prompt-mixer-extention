# Database Setup for GCP Production Environment

This guide explains how to set up the database tables for the Prompt Mixer application in a Google Cloud Platform (GCP) PostgreSQL environment.

## Prerequisites

- Python 3.7+
- Access to your GCP PostgreSQL instance
- Database connection details (host, port, username, password, database name)
- Required Python packages installed (`sqlalchemy`, `psycopg2-binary`, `python-dotenv`)

## Installation

If you don't have the required packages installed, you can install them with:

```bash
pip install sqlalchemy psycopg2-binary python-dotenv
```

## Using the Database Setup Script

The `create_tables.py` script is designed to create all necessary database tables in your GCP PostgreSQL instance.

### Method 1: Using the .env File (Recommended)

The script automatically reads the `DATABASE_URL` from the `.env` file in the backend directory. This is the recommended approach for security and convenience.

1. Edit the `.env` file in the backend directory:

```
# Uncomment and update the PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:port/dbname"
```

2. Run the script:

```bash
python backend/create_tables.py
```

To see SQL statements being executed, add the `--echo` flag:

```bash
python backend/create_tables.py --echo
```

### Method 2: Using Command Line Arguments

You can provide the database connection URL directly as a command line argument, which will override any value in the `.env` file:

```bash
python backend/create_tables.py --db-url "postgresql://username:password@host:port/dbname"
```

### Method 3: Using Environment Variables

Alternatively, you can set the `DATABASE_URL` environment variable:

```bash
# Linux/macOS
export DATABASE_URL="postgresql://username:password@host:port/dbname"
python backend/create_tables.py

# Windows (Command Prompt)
set DATABASE_URL=postgresql://username:password@host:port/dbname
python backend/create_tables.py

# Windows (PowerShell)
$env:DATABASE_URL="postgresql://username:password@host:port/dbname"
python backend/create_tables.py
```

## Database Tables

The script will create the following tables:

1. `users` - User accounts and authentication
2. `prompts` - User-created prompts
3. `tags` - Tags for categorizing prompts
4. `prompt_tags` - Junction table for many-to-many relationship
5. `prompt_history` - History of prompt improvements
6. `user_library` - User's saved prompts library

## Troubleshooting

### Connection Issues

If you encounter connection issues, verify:

- The database server is accessible from your current network
- The username and password are correct
- The database exists on the server
- The database user has permissions to create tables

### Import Errors

If you encounter import errors, make sure you're running the script from the project root directory:

```bash
# Run from the project root directory
python backend/create_tables.py
```

### PostgreSQL Driver Issues

If you get errors related to the PostgreSQL driver, ensure you have `psycopg2-binary` installed:

```bash
pip install psycopg2-binary
```

## Security Note

Be careful with database connection strings that contain passwords. Avoid committing them to version control or sharing them in insecure channels.

For production use, consider using environment variables or a secrets management solution to handle sensitive connection details.
