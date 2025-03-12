from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from app.api.router import api_router
from app.core.config import settings
from app.models import models
from app.core.database import engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Prompt Mixer API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            h1 {
                color: #333;
            }
            .endpoint {
                background-color: #f5f5f5;
                padding: 10px;
                margin-bottom: 10px;
                border-radius: 5px;
            }
            .method {
                font-weight: bold;
                color: #0066cc;
            }
        </style>
    </head>
    <body>
        <h1>Welcome to Prompt Mixer API</h1>
        <p>This API provides authentication and prompt management services for the Prompt Mixer Chrome Extension.</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
            <p><span class="method">POST</span> /api/v1/auth/google</p>
            <p>Authenticate with Google OAuth code</p>
        </div>
        
        <div class="endpoint">
            <span class="method">GET</span> /api/v1/auth/google/callback</p>
            <p>Callback endpoint for Google OAuth</p>
        </div>
        
        <div class="endpoint">
            <span class="method">POST</span> /api/v1/prompts/improve</p>
            <p>Improve a prompt using Claude AI</p>
        </div>
        
        <p>For full API documentation, visit <a href="/docs">/docs</a></p>
    </body>
    </html>
    """
