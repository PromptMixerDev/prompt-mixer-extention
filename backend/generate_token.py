#!/usr/bin/env python
import sys
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

def generate_token(user_id="1", days=30):
    """
    Generate a JWT token for the specified user ID with the given expiration time.
    
    Args:
        user_id (str): The user ID to encode in the token
        days (int): Number of days until token expiration
        
    Returns:
        str: The generated JWT token
    """
    # Create token with expiration date
    expire = datetime.utcnow() + timedelta(days=days)
    to_encode = {"exp": expire, "sub": str(user_id)}
    
    # Encode the token using the app's secret key and algorithm
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return token

if __name__ == "__main__":
    # Get user_id from command line arguments or use default "1"
    user_id = sys.argv[1] if len(sys.argv) > 1 else "1"
    
    # Get days from command line arguments or use default 30
    days = int(sys.argv[2]) if len(sys.argv) > 2 else 30
    
    # Generate the token
    token = generate_token(user_id, days)
    
    # Print the token and usage information
    print("\n=== JWT Token Generator ===")
    print(f"User ID: {user_id}")
    print(f"Expiration: {days} days")
    print("\nToken:")
    print(token)
    print("\nUse this token in the Authorization header:")
    print(f"Authorization: Bearer {token}")
    print("\nOr store it in chrome.storage.local:")
    print("chrome.storage.local.set({ auth: { token: '" + token + "', user: { id: '" + user_id + "', email: 'dev@example.com', displayName: 'Dev User' } } });")
    print("===========================\n")
