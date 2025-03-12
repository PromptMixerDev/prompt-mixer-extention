from datetime import datetime, timedelta
from typing import Any, Optional, Union

from jose import jwt
from passlib.context import CryptContext
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create JWT access token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash password
    """
    return pwd_context.hash(password)

def verify_google_token(token: str) -> dict:
    """
    Verify Google token
    
    This function handles both ID tokens and access tokens from chrome.identity
    """
    try:
        print(f"Verifying Google token: {token[:10]}...")
        
        # First try to verify as ID token
        try:
            print("Trying to verify as ID token...")
            idinfo = id_token.verify_oauth2_token(
                token, requests.Request(), settings.GOOGLE_CLIENT_ID
            )
            print(f"Successfully verified as ID token. User info: {idinfo}")
            return idinfo
        except ValueError as e:
            # Not an ID token, try as access token
            print(f"Not an ID token: {str(e)}")
            pass
        
        # Try as access token
        print("Trying to verify as access token...")
        userinfo_url = "https://www.googleapis.com/oauth2/v1/userinfo"
        headers = {"Authorization": f"Bearer {token}"}
        import requests as http_requests
        response = http_requests.get(userinfo_url, headers=headers)
        
        print(f"Access token response status: {response.status_code}")
        
        if response.status_code != 200:
            response_text = response.text
            print(f"Failed to get user info: {response.status_code}, Response: {response_text}")
            raise ValueError(f"Failed to get user info: {response.status_code}, Response: {response_text}")
        
        userinfo = response.json()
        print(f"Successfully verified as access token. User info: {userinfo}")
        
        # Create a dict similar to what id_token.verify_oauth2_token returns
        return {
            "sub": userinfo.get("id"),
            "email": userinfo.get("email"),
            "name": userinfo.get("name"),
            "picture": userinfo.get("picture")
        }
    except Exception as e:
        # Invalid token
        print(f"Error verifying Google token: {str(e)}")
        raise ValueError(f"Invalid Google token: {str(e)}")
