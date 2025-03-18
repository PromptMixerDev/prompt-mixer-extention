from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.core.security import verify_password, get_password_hash, create_access_token, verify_google_token
from app.core.config import settings
from app.models.models import User
from app.schemas.schemas import UserCreate, UserUpdate

class AuthService:
    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate user with email and password
        """
        user = self.get_user_by_email(db, email)
        if not user:
            return None
        if not user.hashed_password:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def authenticate_google(self, db: Session, token: str) -> Optional[User]:
        """
        Authenticate user with Google token
        """
        try:
            print(f"AuthService.authenticate_google: Authenticating with Google token: {token[:10]}...")
            print(f"AuthService.authenticate_google: Token length: {len(token)}")
            
            # Verify Google token
            print(f"AuthService.authenticate_google: Calling verify_google_token...")
            idinfo = verify_google_token(token)
            print(f"AuthService.authenticate_google: Token verified. User info: {idinfo}")
            
            if "email" not in idinfo:
                print(f"AuthService.authenticate_google: Error: No email in idinfo: {idinfo}")
                return None
            
            # Check if user exists
            print(f"AuthService.authenticate_google: Checking if user exists with email: {idinfo['email']}")
            user = self.get_user_by_email(db, idinfo["email"])
            
            if user:
                print(f"AuthService.authenticate_google: User found: {user.id}, {user.email}")
                # Update user if needed
                update_data = {}
                if not user.google_id:
                    update_data["google_id"] = idinfo["sub"]
                if user.display_name != idinfo.get("name"):
                    update_data["display_name"] = idinfo.get("name")
                if user.photo_url != idinfo.get("picture"):
                    update_data["photo_url"] = idinfo.get("picture")
                
                if update_data:
                    print(f"AuthService.authenticate_google: Updating user with data: {update_data}")
                    user = self.update_user(db, user_id=user.id, obj_in=UserUpdate(**update_data))
                    print(f"AuthService.authenticate_google: User updated: {user.id}, {user.email}")
                else:
                    print(f"AuthService.authenticate_google: No updates needed for user: {user.id}, {user.email}")
            else:
                print(f"AuthService.authenticate_google: User not found, creating new user with email: {idinfo['email']}")
                # Create new user
                user_in = UserCreate(
                    email=idinfo["email"],
                    display_name=idinfo.get("name", idinfo["email"].split("@")[0]),
                    google_id=idinfo["sub"],
                    photo_url=idinfo.get("picture")
                )
                print(f"AuthService.authenticate_google: Creating user with data: {user_in}")
                user = self.create_user(db, obj_in=user_in)
                print(f"AuthService.authenticate_google: New user created: {user.id}, {user.email}")
            
            print(f"AuthService.authenticate_google: Authentication successful, returning user: {user.id}, {user.email}")
            return user
        except ValueError as e:
            print(f"AuthService.authenticate_google: Error authenticating with Google: {e}")
            import traceback
            print(f"AuthService.authenticate_google: Traceback: {traceback.format_exc()}")
            return None
        except Exception as e:
            print(f"AuthService.authenticate_google: Unexpected error in authenticate_google: {str(e)}")
            print(f"AuthService.authenticate_google: Error type: {type(e).__name__}")
            import traceback
            print(f"AuthService.authenticate_google: Traceback: {traceback.format_exc()}")
            return None
    
    def create_user(self, db: Session, obj_in: UserCreate) -> User:
        """
        Create new user
        """
        db_obj = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password) if obj_in.password else None,
            display_name=obj_in.display_name,
            google_id=obj_in.google_id,
            photo_url=obj_in.photo_url,
            is_active=True
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_user(self, db: Session, user_id: int, obj_in: UserUpdate) -> User:
        """
        Update user
        """
        user = self.get_user(db, user_id)
        update_data = obj_in.dict(exclude_unset=True)
        
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        """
        Get user by ID
        """
        return db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """
        Get user by email
        """
        return db.query(User).filter(User.email == email).first()
    
    def get_user_by_google_id(self, db: Session, google_id: str) -> Optional[User]:
        """
        Get user by Google ID
        """
        return db.query(User).filter(User.google_id == google_id).first()
    
    def create_access_token_for_user(self, user_id: int) -> str:
        """
        Create access token for user
        """
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return create_access_token(
            subject=user_id, expires_delta=expires_delta
        )
