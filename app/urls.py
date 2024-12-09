from django.urls import path
from app.views import *

urlpatterns = [
    path("", sign_in, name="sign_in"),
    path("register/", register, name="register"),
    path('verify-otp/', verify_otp, name='verify-otp'),
    path("check-credential/",check_credential,name="check_credential"),
    path("check-email/",check_mail,name="check-mail"),
    path('log_out/', log_out, name='log_out'),
    path('otp/', otp_page, name='otp'),
    path("customer-registration/", company_registration, name="customer-registration"),
    path("products/", list_view, name="products"),
    path("users/", users, name="users"),
    path("history/", history, name="history"),
    path("history2/", history2, name="history2"),
    path("graph/", graph, name="graph"),
    path("upload-apparel/", upload_apparel, name="upload-apparel"),    
    path("emailer/", emailer, name="emailer"),
    path('list_image/', list_image, name='list-image'),
    path("user-setting/", user_setting, name="user-setting"),
    path("email-template/", email_template, name="email-template"),
    path("view-apparel/", upload_stuff, name="view-apparel"),
    path("forgot-password/", forgot_password, name="forgot-password"),
    path('emailotp/', emailotp, name="emailotp"),
    path('set-password/', set_password, name="set-password")
]
