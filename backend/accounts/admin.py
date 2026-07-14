from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import Business, User


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ("name", "pan_vat_number", "default_vat_rate", "is_active")


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "business", "role", "is_staff")
    list_filter = ("role", "business")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("DokanDaftar", {"fields": ("business", "role")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("DokanDaftar", {"fields": ("business", "role")}),
    )