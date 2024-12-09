from django.shortcuts import render,redirect
from django.contrib import messages
from django.contrib.auth.hashers import make_password,check_password
from app.models import *
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.core.mail import EmailMessage
from django.utils.safestring import mark_safe
from django.template.loader import render_to_string  # For rendering email templates
import random  # For generating random OTPs
from app.utils import *


# Create your views here.
def sign_in(request):
    if request.method == 'GET':
        if request.user.is_authenticated:
            return redirect("graph")
        else:
            return render(request, 'login.html')
    
    elif request.method == "POST":
       print(f"{request.POST=}")  # Corrected line to print POST data

       email = request.POST.get('email')
       password = request.POST.get('password')

       user = authenticate(request, username = email, password = password)

       if user is not None:
          login(request, user)
          return redirect('graph')
       else:
          messages.error(request, 'Invalid credentials. Please try again.')
          return redirect('sign_in')

    return render(request, "login.html")



def register(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm-password')

        # Password match validation
        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return redirect('register')

        # Email uniqueness validation
        if User.objects.filter(email=email).exists():
            messages.error(request, "Email is already in use.")
            return redirect('register')

        # Create the user (without OTP verification at this stage)
        user = User.objects.create(
            name=name,
            email=email,
            password=make_password(password)
        )
        user.save()

        # Send OTP to email
        otp = send_otp(email, name)


        # Save OTP to the database for future verification
        OTP.objects.create(user_email=email, otp=otp)

        # Store email in session and redirect to OTP verification
        request.session['email'] = email
        return redirect('verify-otp')

    return render(request, 'register.html')


def verify_otp(request):
    email = request.session.get('email')  # Get email from session

    if email:
        # Call the utility function to mask the email
        masked_email = hiddden_email(email)
    else:
        masked_email = None  # Fallback if email is not in session

    if request.method == 'POST':
        otp_input = ''.join([request.POST.get(f'code_{i}') for i in range(1, 7)])

        try:
            otp_entry = OTP.objects.get(user_email=email, otp=otp_input)
            if otp_entry.is_valid():
                # OTP is valid, activate user
                user = User.objects.get(email=email)
                user.is_active = True  # Activate the user
                user.save()

                # Optionally, delete OTP after successful verification
                otp_entry.delete()

                messages.success(request, "OTP verified successfully! Please login.")
                return redirect('sign_in')
            else:
                messages.error(request, "OTP is expired. Please request a new one.")
        except OTP.DoesNotExist:
            messages.error(request, "Invalid OTP. Please try again.")
        
    return render(request, 'verify_otp.html', {'masked_email': masked_email})  # Pass the masked email to the template




def check_credential(request):
    try:
        user_email = request.POST.get("user_email")
        user_password = request.POST.get("user_password")

        # Get the user with the provided email and ensure it's not deleted
        get_user = User.objects.filter(email=user_email, is_deleted=False).first()

        if get_user:
            if check_password(user_password, get_user.password):
                return JsonResponse({"status": 200})
            else:
                return JsonResponse({"status": 400})
        else:
            return JsonResponse({"status": 400})

    except Exception as ep:
        print(ep)
        return JsonResponse({"status": 400})

def check_mail(request):
    print(request.POST)
    try:
        get_user_email = User.objects.get(email=request.POST.get("user_email"))
        if get_user_email:
            return JsonResponse({
                "status": 200
            })
        else:
            return JsonResponse({
                "status": 400
            })
    except Exception as ep:
        return JsonResponse({
            "status": 400
        })
    
def log_out(request):
   logout(request)
   return redirect('sign_in')

def otp_page(request):
    # Retrieve email from session or redirect if not present
    email = request.session.get('email')
    if email:
        # Call the utility function to mask the email
        masked_email = hiddden_email(email)
    else:
        masked_email = None  # Fallback if email is not in session
    if not email:
        messages.error(request, "Session expired. Please try again.")
        return redirect('forgot-password')

    print(f"Session Email Before POST: {email}")

    if request.method == "POST":
        otp_code = ''.join([request.POST.get(f'code_{i}', '').strip() for i in range(1, 7)])
        print(f"User Entered OTP: {otp_code}")

        try:
            # Fetch OTP for the provided email
            otp_entry = OTP.objects.get(user_email=email, otp=otp_code)
            print(f"OTP Entry Found: {otp_entry}")

            if otp_entry.is_valid():
                otp_entry.delete()
                messages.success(request, "OTP verified successfully!")
                return redirect('set-password')
            else:
                otp_entry.delete()
                messages.error(request, "OTP has expired. Please request a new one.")
                return redirect('forgot-password')

        except OTP.DoesNotExist:
            print(f"No matching OTP entry for Email: {email} and OTP: {otp_code}")
            messages.error(request, "Invalid OTP. Please try again.")
            return redirect('otp')

    return render(request, 'OTP.html', {'masked_email': masked_email})




def company_registration(request):
    return render(request, "company-registration.html")

def upload_and_preview(request):
    return render(request, "upload_and_preview.html")

def list_view(request):
    return render(request, "list_view.html")

def users(request):
    return render(request, "users.html")

def history(request):
    return render(request, "history.html")

def history2(request):
    return render(request, "history2.html")

def graph(request):
    if not request.user.is_authenticated:
        return redirect('sign_in')  # Redirect to login if the user is not authenticated
    return render(request, 'graph.html')  # Your graph page

def upload_apparel(request):
    return render(request, "upload_apparel.html")
   
def emailer(request):
    return render(request, "emailer.html")


def list_image(request):
 return render(request, 'list-image.html')

def user_setting(request):
 return render(request, 'user_setting.html')

def email_template(request):
 return render(request, 'email-template.html')

def upload_stuff(request):
    return render(request, 'upload_stuff.html')

from threading import Thread

class EmailThread(Thread):
    def __init__(self, email):
        self.email = email
        Thread.__init__(self)

    def run(self):
        self.email.send()

def forgot_password(request):
    if request.method == "POST":
        email = request.POST.get('email')

        # Check if email exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            messages.error(request, "No account found with that email address.")
            return redirect('forgot_password')

        # Generate OTP
        otp = random.randint(100000, 999999)

        # Save OTP in database
        OTP.objects.create(user_email=user.email, otp=otp)
        request.session['email'] = email


        # Prepare email content using email-otp-page.html
        email_subject = "Your OTP for Password Reset"
        email_message = render_to_string('email-otp-page.html', {'user': user, 'otp': otp})
        from_email = 'no-reply@atmstech.in'  # Sender email

        email = EmailMessage(email_subject, email_message, from_email, [email])
        email.content_subtype = "html"  # Set email content type to HTML

        # Send email in a separate thread
        EmailThread(email).start()

        # Redirect to OTP verification page
        messages.success(request, "An OTP has been sent to your email address.")
        return redirect('otp')

    return render(request, 'forgot-password.html')


def emailotp(request):
    return render (request, 'email-registration-otp.html')

from django.contrib.auth.hashers import make_password

def set_password(request):
    # Retrieve email from session
    email = request.session.get('email')
    if not email:
        messages.error(request, "Session expired. Please try again.")
        return redirect('forgot-password')

    if request.method == 'POST':
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm-password')

        # Check if both passwords match
        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return redirect('set-password')

        # Validate password strength (optional)
        if len(password) < 8:
            messages.error(request, "Password must be at least 8 characters long.")
            return redirect('set-password')

        # Update user's password
        try:
            user = User.objects.get(email=email)
            user.password = make_password(password)
            user.save()

            # Clear email from session after successful password reset
            del request.session['email']

            messages.success(request, "Password reset successful! Please log in.")
            return redirect('sign_in')

        except User.DoesNotExist:
            messages.error(request, "User does not exist. Please try again.")
            return redirect('forgot-password')

    return render(request, 'set-password.html')
