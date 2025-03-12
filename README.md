# Prompt Mixer Extension

Chrome extension for working with AI prompts. This extension allows users to save, organize, and share prompts for AI tools like ChatGPT and Claude.

## Project Structure

The project consists of two main parts:

1. **Frontend**: Chrome extension built with React, TypeScript, and Vite
2. **Backend**: API server built with FastAPI and PostgreSQL

## Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL (v14+)
- Google Cloud project with OAuth 2.0 credentials

## Setup

### Backend

1. Create a PostgreSQL database:

```bash
createdb prompt_mixer
```

2. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

3. Configure environment variables:

```bash
cp .env.example .env
# Edit .env file with your database credentials and Google OAuth client ID
```

   For local development, you can use SQLite instead of PostgreSQL:
   
   ```
   # Database
   DATABASE_URL="sqlite:///./prompt_mixer.db"
   
   # PostgreSQL (for production)
   # DATABASE_URL="postgresql://prompt_mixer_user:password@host:5432/prompt_mixer"
   ```

4. Run the server:

```bash
cd backend
python run.py
```

The API will be available at http://localhost:8000.

### Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Build the extension:

```bash
cd frontend
npm run build
```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `frontend/dist` directory

## Development

### Backend

Run the development server with auto-reload:

```bash
cd backend
python run.py
```

### Frontend

Run the development server:

```bash
cd frontend
npm run dev
```

## Google Cloud Setup

1. Create a project in Google Cloud Console
2. Enable the Google People API
3. Create OAuth 2.0 credentials for Chrome Extension
4. Add the client ID to:
   - `frontend/public/manifest.json` in the `oauth2.client_id` field
   - `backend/.env` in the `GOOGLE_CLIENT_ID` field

## Features

- Google authentication using chrome.identity API and JWT tokens
- Save and organize prompts
- Share prompts with other users
- Inject prompts into ChatGPT and Claude

## Authentication Flow

1. User clicks "Sign in with Google" in the extension
2. Chrome extension API (chrome.identity) is used to get a Google OAuth token
3. The token is sent to the backend API
4. Backend verifies the token with Google
5. If valid, backend creates or updates the user in the database
6. Backend generates a JWT token and sends it back to the extension
7. Extension stores the JWT token and user info in chrome.storage
8. JWT token is used for all subsequent API requests
