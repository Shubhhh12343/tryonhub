# utils.py
import random
from threading import Thread
from django.template.loader import render_to_string
from django.core.mail import EmailMessage

class EmailOTPThread(Thread):
    def __init__(self, email):
        self.email = email
        Thread.__init__(self)

    def run(self):
        self.email.send()

# Function to send OTP email using a template
def send_otp(email, user_name):
    otp = str(random.randint(100000, 999999))  # Generate a 6-digit OTP
    
    # Render the email content from the template
    email_subject = "Verify Your Email - TryOnHub Registration"
    email_content = render_to_string('email-registration-otp.html', {'user': {'name': user_name}, 'otp': otp})
    from_email = 'no-reply@atmstech.in'  # Sender email

    # Create the email
    email_message = EmailMessage(
        subject=email_subject,
        body=email_content,
        from_email=from_email,
        to=[email],
    )
    email_message.content_subtype = "html"  # Email is HTML

    # Send the email in a separate thread
    EmailOTPThread(email_message).start()

    return otp


def hiddden_email(email):

    if email:
        list_email = email.split('@')  # []
        if len(list_email[0]) >= 2:
            list_email[0] = list_email[0][0] + "*****"
    return '@'.join(list_email)