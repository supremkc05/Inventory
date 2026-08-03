from django.urls import path

from accounts.views import (
    InviteStaffView,
    LoginView,
    LogoutView,
    MeView,
    RefreshView,
    SignupView,
)

urlpatterns = [
    path("signup/", SignupView.as_view(), name="auth-signup"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("refresh/", RefreshView.as_view(), name="auth-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("invite/", InviteStaffView.as_view(), name="auth-invite"),
]
