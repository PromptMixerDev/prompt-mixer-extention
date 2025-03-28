from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from app.schemas.user_library import UserLibrary, UserLibraryCreate, UserLibraryUpdate, UserLibraryList
from app.services.user_library import user_library_service
from app.core.database import get_db
from app.api.endpoints.users import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("", response_model=UserLibraryList)
async def get_user_library(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's prompt library
    
    This endpoint returns the user's prompt library with pagination.
    """
    print(f"get_user_library: Received request with skip={skip}, limit={limit}")
    print(f"get_user_library: Current user: id={current_user.id}, email={current_user.email}")
    
    try:
        print(f"get_user_library: Calling user_library_service.get_library_items")
        items, total = user_library_service.get_library_items(
            db=db,
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
        print(f"get_user_library: Retrieved {len(items)} items out of {total} total")
        
        response = {"items": items, "total": total}
        print(f"get_user_library: Returning response with {len(items)} items")
        return response
    except Exception as e:
        print(f"get_user_library: Error: {str(e)}")
        print(f"get_user_library: Error type: {type(e).__name__}")
        import traceback
        print(f"get_user_library: Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error getting user library: {str(e)}")

@router.get("/{item_id}", response_model=UserLibrary)
async def get_library_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific library item
    
    This endpoint returns a specific prompt library item by its ID.
    """
    try:
        item = user_library_service.get_library_item(
            db=db,
            item_id=item_id,
            user_id=current_user.id
        )
        
        if not item:
            raise HTTPException(status_code=404, detail="Library item not found")
            
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting library item: {str(e)}")

@router.post("", response_model=UserLibrary)
async def create_library_item(
    item: UserLibraryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new library item
    
    This endpoint creates a new prompt library item.
    """
    try:
        return user_library_service.create_library_item(
            db=db,
            item=item,
            user_id=current_user.id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating library item: {str(e)}")

@router.put("/{item_id}", response_model=UserLibrary)
async def update_library_item(
    item_id: int,
    item: UserLibraryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a library item
    
    This endpoint updates a specific prompt library item by its ID.
    """
    try:
        updated_item = user_library_service.update_library_item(
            db=db,
            item_id=item_id,
            item=item,
            user_id=current_user.id
        )
        
        if not updated_item:
            raise HTTPException(status_code=404, detail="Library item not found")
            
        return updated_item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating library item: {str(e)}")

@router.delete("/{item_id}")
async def delete_library_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a library item
    
    This endpoint deletes a specific prompt library item by its ID.
    """
    try:
        deleted = user_library_service.delete_library_item(
            db=db,
            item_id=item_id,
            user_id=current_user.id
        )
        
        if not deleted:
            raise HTTPException(status_code=404, detail="Library item not found")
            
        return {"message": "Library item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting library item: {str(e)}")

@router.post("/from-history/{history_id}", response_model=UserLibrary)
async def create_from_history(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a library item from history
    
    This endpoint creates a new prompt library item from a history item.
    """
    try:
        item = user_library_service.create_from_history(
            db=db,
            history_id=history_id,
            user_id=current_user.id
        )
        
        if not item:
            raise HTTPException(status_code=404, detail="History item not found")
            
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating library item from history: {str(e)}")
