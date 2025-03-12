import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

def get_auth():
    """Get Firebase Auth instance"""
    return auth
