# Prompt Mixer Backend

Backend API for the Prompt Mixer Chrome Extension.

## Features

- Google OAuth authentication
- Firebase integration
- User management
- Prompt management (coming soon)

## Prerequisites

- Python 3.8+
- Firebase project with Authentication and Firestore enabled
- Google OAuth credentials

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/prompt-mixer-extention.git
cd prompt-mixer-extention/backend
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following values in the `.env` file:

- `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to your Firebase service account key JSON file
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `GOOGLE_REDIRECT_URI`: Your Google OAuth redirect URI (default: http://localhost:8000/api/v1/auth/google/callback)

## Running the server

```bash
python run.py
```

The server will start at http://localhost:8000.

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication

- `POST /api/v1/auth/google`: Authenticate with Google OAuth code
- `GET /api/v1/auth/google/callback`: Callback endpoint for Google OAuth

## Development

To run the server in development mode with auto-reload:

```bash
python run.py
```

## License

MIT
