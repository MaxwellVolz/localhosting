import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str = None
):
    """
    Send email using SMTP

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML body content
        text_content: Plain text body (optional, falls back to stripped HTML)
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["From"] = settings.SMTP_FROM_EMAIL
        message["To"] = to_email
        message["Subject"] = subject

        # Add plain text version
        if text_content:
            text_part = MIMEText(text_content, "plain")
            message.attach(text_part)

        # Add HTML version
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)

        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_USE_TLS,
        )

        logger.info(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


async def send_contact_notification(name: str, email: str, phone: str, message: str = ""):
    """
    Send notification email when contact form is submitted

    Args:
        name: Submitter's name
        email: Submitter's email
        phone: Submitter's phone
        message: Optional message from submitter
    """
    subject = f"New Contact Form Submission from {name}"

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2c3e50;">New Contact Form Submission</h2>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> <a href="mailto:{email}">{email}</a></p>
                <p><strong>Phone:</strong> <a href="tel:{phone}">{phone}</a></p>
                {f'<p><strong>Message:</strong></p><p style="background-color: white; padding: 15px; border-left: 4px solid #3498db;">{message}</p>' if message else ''}
            </div>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

            <p style="color: #7f8c8d; font-size: 12px;">
                This email was sent from your contact form at {settings.APP_NAME}
            </p>
        </body>
    </html>
    """

    text_content = f"""
    New Contact Form Submission

    Name: {name}
    Email: {email}
    Phone: {phone}
    {'Message: ' + message if message else ''}

    ---
    This email was sent from your contact form at {settings.APP_NAME}
    """

    return await send_email(
        to_email=settings.CONTACT_EMAIL_RECIPIENT,
        subject=subject,
        html_content=html_content,
        text_content=text_content
    )


async def send_confirmation_email(name: str, email: str):
    """
    Send confirmation email to the person who submitted the form

    Args:
        name: Submitter's name
        email: Submitter's email
    """
    subject = "Thank you for contacting us"

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2c3e50;">Thank you for reaching out!</h2>

            <p>Hi {name},</p>

            <p>We've received your message and will get back to you as soon as possible.</p>

            <p>Best regards,<br>
            {settings.APP_NAME} Team</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

            <p style="color: #7f8c8d; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
            </p>
        </body>
    </html>
    """

    text_content = f"""
    Thank you for reaching out!

    Hi {name},

    We've received your message and will get back to you as soon as possible.

    Best regards,
    {settings.APP_NAME} Team

    ---
    This is an automated message. Please do not reply to this email.
    """

    return await send_email(
        to_email=email,
        subject=subject,
        html_content=html_content,
        text_content=text_content
    )
