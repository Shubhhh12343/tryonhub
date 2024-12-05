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
    if request.method == "POST":
       print(f"{request.POST=}")
       name = request.POST.get('name')
       email = request.POST.get('email')
       password = request.POST.get('password')
       confirm_password = request.POST.get('confirm-password')

       if password != confirm_password:
          messages.error(request, 'Passwords do not match')
          return redirect('register')

       if User.objects.filter(email=email).exists():
          messages.error(request, 'Email already in use')
          return redirect('register')
       
       user = User.objects.create(
          name = name,
          email = email,
          password = make_password(password)
       )
       user.save()
       messages.success(request, "Account created successfully! Please log in.")
       return redirect('sign_in')

    return render(request, "register.html")

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
    return render(request, 'OTP.html')

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


# def upload_image(request):
#     return render(request, 'upload_stuff.html')

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
        OTP.objects.create(user=user, otp=otp)

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
    return render (request, 'email-otp-page.html')