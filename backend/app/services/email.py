import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = settings.EMAIL_SMTP_HOST
        self.smtp_port = settings.EMAIL_SMTP_PORT
        self.username = settings.EMAIL_SMTP_USERNAME
        self.password = settings.EMAIL_SMTP_PASSWORD
        self.from_address = settings.EMAIL_FROM_ADDRESS
        self.from_name = settings.EMAIL_FROM_NAME

    async def send_email(self, to_email: str, subject: str, body: str, is_html: bool = False):
        """Send email using SMTP"""
        if not self.username or not self.password:
            logger.warning("SMTP credentials not configured")
            return False

        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{self.from_name} <{self.from_address}>"
            msg['To'] = to_email
            msg['Subject'] = subject

            # Add body
            if is_html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False

    async def send_contact_inquiry(self, name: str, email: str, phone: str, message: str, puppy_name: str = None):
        """Send contact inquiry notification to admin"""
        subject = f"New Contact Inquiry - {name}"
        if puppy_name:
            subject += f" (Interest in {puppy_name})"

        body = f"""
New contact inquiry received:

Name: {name}
Email: {email}
Phone: {phone}
{'Puppy of Interest: ' + puppy_name if puppy_name else ''}

Message:
{message}

---
This email was sent automatically from the Double JS Doodles website.
        """.strip()

        # Send to admin (using from_address as admin email)
        return await self.send_email(self.from_address, subject, body)

    async def send_puppy_inquiry(self, name: str, email: str, phone: str, puppy_name: str, litter_name: str, message: str):
        """Send puppy-specific inquiry notification"""
        subject = f"Puppy Inquiry - {puppy_name} from {litter_name}"

        body = f"""
New puppy inquiry received:

Puppy: {puppy_name}
Litter: {litter_name}

Contact Information:
Name: {name}
Email: {email}
Phone: {phone}

Message:
{message}

---
This email was sent automatically from the Double JS Doodles website.
        """.strip()

        return await self.send_email(self.from_address, subject, body)

    async def send_password_reset_code(self, email: str, reset_code: str):
        """Send password reset code to admin email"""
        subject = "Double JS Doodles - Password Reset Code"

        body = f"""
Hello,

You have requested a password reset for your Double JS Doodles admin account.

Your verification code is: {reset_code}

This code will expire in 20 minutes.

If you did not request this password reset, please ignore this email.

---
Double JS Doodles Admin System
        """.strip()

        return await self.send_email(email, subject, body)

email_service = EmailService()