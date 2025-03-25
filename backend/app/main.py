from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.models import models
from app.core.database import engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Custom middleware to handle CORS preflight requests
class NoRedirectMiddleware(BaseHTTPMiddleware):
    """
    Middleware to prevent redirects on preflight requests.
    
    This middleware checks if the request is a CORS preflight (OPTIONS) request
    and ensures no redirects are returned for these requests, which would cause
    CORS errors in browsers.
    """
    async def dispatch(self, request: Request, call_next):
        # If this is a preflight request (OPTIONS), ensure we don't redirect
        if request.method == "OPTIONS":
            # Process the request normally
            response = await call_next(request)
            
            # If the response is a redirect (3xx status code), 
            # replace it with a 200 OK response to prevent CORS issues
            if 300 <= response.status_code < 400:
                return Response(
                    status_code=200,
                    headers={
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "*",
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Allow-Credentials": "true",
                    }
                )
            return response
        
        # For non-preflight requests, process normally
        return await call_next(request)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Add the custom middleware to prevent redirects on preflight requests
app.add_middleware(NoRedirectMiddleware)

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
