import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import Any

from app.core.database import get_db
from app.core.config import settings
from app.services.auth import AuthService

router = APIRouter()
auth_service = AuthService()

# Configure Stripe with API key
stripe.api_key = settings.STRIPE_API_KEY

@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)) -> Any:
    """
    Handle Stripe webhook events
    
    This endpoint receives webhook events from Stripe and processes them to update
    user payment status. It verifies the webhook signature to ensure the request
    is legitimate and handles various subscription and checkout events.
    
    Args:
        request: The incoming webhook request
        db: Database session
        
    Returns:
        dict: A success message
        
    Raises:
        HTTPException: If the webhook signature verification fails or if the event
                      cannot be processed
    """
    # Get the webhook payload and signature header
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not sig_header:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature header",
        )
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payload: {str(e)}",
        )
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid signature: {str(e)}",
        )
    
    # Handle the event
    if event["type"] == "checkout.session.completed":
        # Payment is successful and the subscription is created
        handle_checkout_session_completed(db, event["data"]["object"])
    elif event["type"] == "customer.subscription.updated":
        # Subscription was updated
        handle_subscription_updated(db, event["data"]["object"])
    elif event["type"] == "customer.subscription.deleted":
        # Subscription was canceled
        handle_subscription_deleted(db, event["data"]["object"])
    
    return {"success": True}

def handle_checkout_session_completed(db: Session, session: dict) -> None:
    """
    Handle checkout.session.completed event
    
    Updates the user's payment status to "paid" when a checkout session is completed.
    
    Args:
        db: Database session
        session: Stripe checkout session object
    """
    # Get customer email from the session
    customer_email = session.get("customer_details", {}).get("email")
    
    if not customer_email:
        print(f"No customer email found in session: {session.get('id')}")
        return
    
    # Find user by email
    user = auth_service.get_user_by_email(db, customer_email)
    
    if not user:
        print(f"User with email {customer_email} not found")
        return
    
    # Update user payment status
    from app.schemas.schemas import UserUpdate
    user_update = UserUpdate(payment_status="paid")
    auth_service.update_user(db, user_id=user.id, obj_in=user_update)
    
    print(f"Updated payment status to 'paid' for user {user.id} ({user.email})")

def handle_subscription_updated(db: Session, subscription: dict) -> None:
    """
    Handle customer.subscription.updated event
    
    Updates the user's payment status based on the subscription status.
    
    Args:
        db: Database session
        subscription: Stripe subscription object
    """
    # Get customer ID from the subscription
    customer_id = subscription.get("customer")
    
    if not customer_id:
        print(f"No customer ID found in subscription: {subscription.get('id')}")
        return
    
    # Get customer details to find email
    try:
        customer = stripe.Customer.retrieve(customer_id)
        customer_email = customer.get("email")
        
        if not customer_email:
            print(f"No email found for customer: {customer_id}")
            return
        
        # Find user by email
        user = auth_service.get_user_by_email(db, customer_email)
        
        if not user:
            print(f"User with email {customer_email} not found")
            return
        
        # Update user payment status based on subscription status
        status = subscription.get("status")
        payment_status = "paid" if status in ["active", "trialing"] else "unpaid"
        
        from app.schemas.schemas import UserUpdate
        user_update = UserUpdate(payment_status=payment_status)
        auth_service.update_user(db, user_id=user.id, obj_in=user_update)
        
        print(f"Updated payment status to '{payment_status}' for user {user.id} ({user.email})")
    
    except stripe.error.StripeError as e:
        print(f"Stripe error retrieving customer {customer_id}: {str(e)}")

def handle_subscription_deleted(db: Session, subscription: dict) -> None:
    """
    Handle customer.subscription.deleted event
    
    Updates the user's payment status to "unpaid" when a subscription is canceled.
    
    Args:
        db: Database session
        subscription: Stripe subscription object
    """
    # Get customer ID from the subscription
    customer_id = subscription.get("customer")
    
    if not customer_id:
        print(f"No customer ID found in subscription: {subscription.get('id')}")
        return
    
    # Get customer details to find email
    try:
        customer = stripe.Customer.retrieve(customer_id)
        customer_email = customer.get("email")
        
        if not customer_email:
            print(f"No email found for customer: {customer_id}")
            return
        
        # Find user by email
        user = auth_service.get_user_by_email(db, customer_email)
        
        if not user:
            print(f"User with email {customer_email} not found")
            return
        
        # Update user payment status to unpaid
        from app.schemas.schemas import UserUpdate
        user_update = UserUpdate(payment_status="unpaid")
        auth_service.update_user(db, user_id=user.id, obj_in=user_update)
        
        print(f"Updated payment status to 'unpaid' for user {user.id} ({user.email})")
    
    except stripe.error.StripeError as e:
        print(f"Stripe error retrieving customer {customer_id}: {str(e)}")
