"""Auth API views: signup, login, me."""

from rest_framework import status
from rest_framework.generics import CreateAPIView, RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from accounts.serializers import (
    BusinessProfileSerializer,
    EmailTokenObtainPairSerializer,
    InviteStaffSerializer,
    SignupSerializer,
    UserBriefSerializer,
)
from accounts.throttles import (
    AuthLoginEmailThrottle,
    AuthLoginIPThrottle,
    AuthRefreshIPThrottle,
    AuthSignupIPThrottle,
)
from core.permissions import IsOwner
from core.tenancy import get_user_business
from rest_framework.exceptions import NotFound


class SignupView(CreateAPIView):
    """
    POST /api/v1/auth/signup/

    Body:
      business_name, full_name, email, password, confirm_password, pan_vat_number

    Returns 201: { user }  (no access/refresh — client must log in)
    """

    serializer_class = SignupSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthSignupIPThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/

    Body: { email, password }
    Returns 200: { user, access, refresh }
    """

    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [AllowAny]
    throttle_classes = [AuthLoginIPThrottle, AuthLoginEmailThrottle]

class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Body: { "refresh": "<refresh_token>" }
    Blacklists the refresh token (access expires on its own ~15m).
    """
    permission_classes = [IsAuthenticated]  # or AllowAny if you prefer
    def post(self, request, *args, **kwargs):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response(
                {"refresh": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except TokenError:
            # Already blacklisted / invalid / expired — still OK for logout UX
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class RefreshView(TokenRefreshView):
    """
    POST /api/v1/auth/refresh/

    Body: { refresh }
    Returns 200: { access }  (and new refresh if ROTATE_REFRESH_TOKENS)
    """

    permission_classes = [AllowAny]
    throttle_classes = [AuthRefreshIPThrottle]


class MeView(RetrieveAPIView):
    """
    GET /api/v1/auth/me/

    Header: Authorization: Bearer <access>
    Returns 200: { id, email, full_name, role, business }
    """

    serializer_class = UserBriefSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class InviteStaffView(CreateAPIView):
    """
    POST /api/v1/auth/invite/

    Owner-only. Creates admin/accountant under the owner's business.
    Client cannot assign a different business_id (ignored / not accepted).
    """

    serializer_class = InviteStaffSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BusinessProfileView(RetrieveUpdateAPIView):
    """
    GET/PATCH /api/v1/business/

    Returns the authenticated user's business.
    PATCH is owner-only (name, PAN, address, phone, default_vat_rate).
    """

    serializer_class = BusinessProfileSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsOwner()]

    def get_object(self):
        business = get_user_business(self.request.user)
        if business is None:
            raise NotFound("No business associated with this user.")
        return business
