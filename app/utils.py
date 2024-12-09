# utils.py
from django.core.mail import EmailMessage
from django.core.mail import send_mail
import random

def send_otp(email):
    otp = str(random.randint(100000, 999999))  # generate a 6 digit OTP
    subject = 'Your OTP Code'
    message = f'Your OTP code is {otp}. It is valid for 10 minutes.'
    send_mail(subject, message, 'from@example.com', [email])

    return otp


def hiddden_email(email):

    if email:
        list_email = email.split('@')  # []
        if len(list_email[0]) >= 2:
            list_email[0] = list_email[0][0] + "*****"
    return '@'.join(list_email)