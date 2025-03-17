from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password
from app.models.models import User
from app.schemas.schemas import User as UserSchema, UserUpdate
from app.services.auth import AuthService

router = APIRouter()
auth_service = AuthService()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Get current user from token
    """
    print(f"get_current_user: Received token: {token[:10]}...")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        print(f"get_current_user: Decoding token with SECRET_KEY: {settings.SECRET_KEY[:5]}... and ALGORITHM: {settings.ALGORITHM}")
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        print(f"get_current_user: Token decoded successfully. Payload: {payload}")
        
        user_id: str = payload.get("sub")
        if user_id is None:
            print("get_current_user: No 'sub' field in token payload")
            raise credentials_exception
        
        print(f"get_current_user: User ID from token: {user_id}")
    except JWTError as e:
        print(f"get_current_user: JWT error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"get_current_user: Unexpected error decoding token: {str(e)}")
        print(f"get_current_user: Error type: {type(e).__name__}")
        import traceback
        print(f"get_current_user: Traceback: {traceback.format_exc()}")
        raise credentials_exception
    
    try:
        print(f"get_current_user: Getting user with ID: {user_id}")
        user = auth_service.get_user(db, int(user_id))
        
        if user is None:
            print(f"get_current_user: User with ID {user_id} not found")
            raise credentials_exception
        
        print(f"get_current_user: User found: {user.id}, {user.email}")
        return user
    except ValueError as e:
        print(f"get_current_user: ValueError: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"get_current_user: Unexpected error getting user: {str(e)}")
        print(f"get_current_user: Error type: {type(e).__name__}")
        import traceback
        print(f"get_current_user: Traceback: {traceback.format_exc()}")
        raise credentials_exception

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user
    """
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user
    """
    user = auth_service.update_user(db, user_id=current_user.id, obj_in=user_in)
    return user
