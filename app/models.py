from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .manager import UserManager
from django.core.validators import validate_email
from django.utils.timezone import now
from datetime import timedelta

# User Model
class User(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=255, default="")  # default changed to empty string
    email = models.EmailField(unique=True, validators=[validate_email])
    password = models.CharField(max_length=255)  # Inherited from AbstractBaseUser, so optional here
    contact = models.PositiveBigIntegerField(default=0, blank=True, null=True)  # Optional field
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)  # BooleanField for soft delete

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']  # Only 'name' is required to create the user

    def __str__(self):
        return self.email


# OTP Model
class OTP(models.Model):
    user_email = models.EmailField(default="")  # Storing email for OTP verification
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        """
        Checks if the OTP is still valid (not expired) based on a 10-minute window.
        """
        expiry_time = self.created_at + timedelta(minutes=10)
        return now() <= expiry_time

    def __str__(self):
        return f"OTP for {self.user_email}: {self.otp} (valid: {self.is_valid()})"

    @classmethod
    def generate_otp(cls):
        """
        Generates a 6-digit random OTP.
        """
        import random
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        return otp
