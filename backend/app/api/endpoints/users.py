from fastapi import APIRouter, Depends, HTTPException, status, Path
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from typing import Literal

from app.core.database import get_db
from app.core.config import settings
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
    
def is_admin(user: User) -> bool:
    """
    Check if a user is an admin based on their email
    
    Args:
        user: User object to check
        
    Returns:
        bool: True if the user is an admin, False otherwise
    """
    return user.email in settings.ADMIN_EMAILS

def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current user and verify they have admin privileges
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User: Current user if they are an admin
        
    Raises:
        HTTPException: If the user is not an admin
    """
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user



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

@router.put("/{user_id}/payment-status", response_model=UserSchema)
async def update_user_payment_status(
    user_id: int = Path(..., title="The ID of the user to update"),
    payment_status: Literal["paid", "unpaid"] = "paid",
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update a user's payment status (admin only)
    
    Args:
        user_id: ID of the user to update
        payment_status: New payment status ("paid" or "unpaid")
        admin_user: Current admin user
        db: Database session
        
    Returns:
        User: Updated user
        
    Raises:
        HTTPException: If the user is not found
    """
    # Get the user to update
    user = auth_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )
    
    # Update the user's payment status
    user_update = UserUpdate(payment_status=payment_status)
    updated_user = auth_service.update_user(db, user_id=user_id, obj_in=user_update)
    
    return updated_user

@router.get("/admin/users", response_model=list[UserSchema])
async def list_users(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    List all users (admin only)
    
    Args:
        admin_user: Current admin user
        db: Database session
        skip: Number of users to skip
        limit: Maximum number of users to return
        
    Returns:
        list[User]: List of users
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users
