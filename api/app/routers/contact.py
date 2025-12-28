from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from app.schemas.contact import ContactForm, ContactResponse
from app.core.email import send_contact_notification, send_confirmation_email
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=ContactResponse)
async def submit_contact_form(
    form: ContactForm,
    background_tasks: BackgroundTasks
):
    """
    Submit contact form

    Sends two emails:
    1. Notification email to site owner with form details
    2. Confirmation email to the person who submitted the form

    Emails are sent in the background to avoid blocking the response.
    """
    try:
        # Log the submission
        logger.info(
            f"Contact form submission: {form.name} ({form.email}) - {form.phone}"
        )

        # Send emails in the background (non-blocking)
        background_tasks.add_task(
            send_contact_notification,
            name=form.name,
            email=form.email,
            phone=form.phone,
            message=form.message
        )

        background_tasks.add_task(
            send_confirmation_email,
            name=form.name,
            email=form.email
        )

        return ContactResponse(
            success=True,
            message="Thank you for contacting us! We'll be in touch soon.",
            timestamp=datetime.utcnow()
        )

    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process contact form. Please try again later."
        )


@router.post("/send-now", response_model=ContactResponse)
async def submit_contact_form_sync(form: ContactForm):
    """
    Submit contact form with synchronous email sending

    Use this endpoint if you need to wait for email confirmation.
    Response will be slower but you'll know if emails were sent successfully.
    """
    try:
        # Log the submission
        logger.info(
            f"Contact form submission (sync): {form.name} ({form.email}) - {form.phone}"
        )

        # Send notification email
        notification_sent = await send_contact_notification(
            name=form.name,
            email=form.email,
            phone=form.phone,
            message=form.message
        )

        # Send confirmation email
        confirmation_sent = await send_confirmation_email(
            name=form.name,
            email=form.email
        )

        if not notification_sent:
            logger.warning("Failed to send notification email")

        if not confirmation_sent:
            logger.warning("Failed to send confirmation email")

        # Return success even if emails failed (form was still received)
        return ContactResponse(
            success=True,
            message="Thank you for contacting us! We'll be in touch soon.",
            timestamp=datetime.utcnow()
        )

    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process contact form. Please try again later."
        )
