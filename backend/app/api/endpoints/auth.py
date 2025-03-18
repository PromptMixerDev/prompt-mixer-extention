from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.auth import AuthService
from app.schemas.schemas import Token, User, GoogleAuthRequest, GoogleAuthResponse

router = APIRouter()
auth_service = AuthService()

@router.post("/login", response_model=Token)
async def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = auth_service.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_service.create_access_token_for_user(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/google", response_model=GoogleAuthResponse)
async def login_with_google(
    auth_request: GoogleAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate with Google token
    """
    print(f"login_with_google: Received request with token: {auth_request.token[:10]}...")
    print(f"login_with_google: Token length: {len(auth_request.token)}")
    
    try:
        user = auth_service.authenticate_google(db, auth_request.token)
        
        if not user:
            print("login_with_google: Authentication failed, user is None")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        print(f"login_with_google: Authentication successful, user: {user.id}, {user.email}")
        access_token = auth_service.create_access_token_for_user(user.id)
        print(f"login_with_google: Access token created: {access_token[:10]}...")
        
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
        print(f"login_with_google: Returning response with user: {user.id}, {user.email}")
        
        return response_data
    except HTTPException as e:
        print(f"login_with_google: HTTP exception: {e.detail}, status_code: {e.status_code}")
        raise
    except Exception as e:
        print(f"login_with_google: Unexpected error: {str(e)}")
        print(f"login_with_google: Error type: {type(e).__name__}")
        import traceback
        print(f"login_with_google: Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}",
        )
