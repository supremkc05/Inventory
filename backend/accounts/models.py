from enum import unique
from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import TimeStampedModel


class Business(TimeStampedModel):
    name = models.CharField(max_length=255)
    pan_vat_number = models.CharField(max_length=9, unique=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    default_vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=13.00)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "businesses"

    def __str__(self):
        return self.name


class User(AbstractUser):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        ADMIN = "admin", "Admin"
        ACCOUNTANT = "accountant", "Accountant"

    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="users",
        null=True,
        blank=True,  # allow null for first superuser
    )
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ADMIN)
   
    #email is unique and indexed for faster lookups
    email = models.EmailField(unique= True, db_index= True)

    def __str__(self):
        return self.username