from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .manager import UserManager
from django.core.validators import validate_email
from django.db.models import *
from django.utils.timezone import now
from datetime import timedelta

# Create your models here.
class User(AbstractBaseUser, PermissionsMixin):
    
    name = CharField(max_length=255, default=" ")

    email = EmailField(unique=True, validators=[validate_email])
    password = CharField(max_length=255, default="")

    contact = PositiveBigIntegerField(default=0)


    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_deleted = BooleanField(default=False)

    objects = UserManager()


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.email

class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        # OTP is valid for 10 minutes
        return now() <= self.created_at + timedelta(minutes=10)