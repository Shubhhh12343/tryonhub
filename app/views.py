from django.shortcuts import render

# Create your views here.
def sign_in(request):
    return render(request, "login.html")


def register(request):
    return render(request, "register.html")


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
    return render(request, "graph.html")

def upload_appreal(request):
    return render(request, "upload_appreal.html")
   
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

def forgot_password(request):
   return render(request, 'forgot-password.html')