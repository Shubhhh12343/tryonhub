from django.urls import path
from app.views import *

urlpatterns = [
    path("", sign_in, name="sign_in"),
    path("register/", register, name="register"),
    path("customer-registration/", company_registration, name="customer-registration"),
    path("products/", list_view, name="products"),
    path("users/", users, name="users"),
    path("history/", history, name="history"),
    path("history2/", history2, name="history2"),
    path("graph/", graph, name="graph"),
    path("upload-appreal/", upload_appreal, name="upload-appreal"),
    path("emailer/", emailer, name="emailer"),
    # path('upload_image',upload_image,name='upload_image'),
    path('list_image/', list_image, name='list-image'),
    path("user-setting/", user_setting, name="user-setting"),
    path("email-template/", email_template, name="email-template"),
    path("view-appreal/", upload_stuff, name="view-appreal"),
]
