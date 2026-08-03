# backend/accounts/serializers.py
from __future__ import annotations
import re
from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from accounts.models import Business
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()

PAN_RE = re.compile(r"^\d{9}$")


class BusinessBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ("id", "name", "pan_vat_number", "address", "phone", "default_vat_rate")


class UserBriefSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    business = BusinessBriefSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "full_name", "role", "business")

    def get_full_name(self, obj: User) -> str:
        name = obj.get_full_name().strip()
        return name or obj.username


class SignupSerializer(serializers.Serializer):
    business_name = serializers.CharField(max_length=255)
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    
    # Required because Business.pan_vat_number is unique + non-blank.
    # Change to required=False if you later allow blank PAN on Business.
    
    pan_vat_number = serializers.CharField(max_length=9)

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        if User.objects.filter(username__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_pan_vat_number(self, value: str) -> str:
        pan = value.strip()
        if not PAN_RE.match(pan):
            raise serializers.ValidationError("PAN/VAT number must be exactly 9 digits.")
        if Business.objects.filter(pan_vat_number=pan).exists():
            raise serializers.ValidationError("This PAN/VAT number is already registered.")
        return pan

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
            {"confirm_password": "Passwords do not match."}
        )

    # Run Django AUTH_PASSWORD_VALIDATORS (not just min_length=8).
        user = User(
            username=attrs["email"],
            email=attrs["email"],
            first_name=attrs["full_name"].strip().split(None, 1)[0],
        )
        try:
            validate_password(attrs["password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})

        return attrs

    @transaction.atomic
    def create(self, validated_data: dict) -> User:
        business = Business.objects.create(
            name=validated_data["business_name"].strip(),
            pan_vat_number=validated_data["pan_vat_number"],
        )

        full_name = validated_data["full_name"].strip()
        parts = full_name.split(None, 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

        email = validated_data["email"]
        user = User(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            business=business,
            role=User.Role.OWNER,
        )
        user.set_password(validated_data["password"])
        user.save()
        return user

    def to_representation(self, instance: User) -> dict:
        # No JWTs on signup — client must log in afterward.
        return {"user": UserBriefSerializer(instance).data}


class InviteStaffSerializer(serializers.Serializer):
    """Owner invites admin/accountant into their own business (B19)."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=150)
    role = serializers.ChoiceField(
        choices=[User.Role.ADMIN, User.Role.ACCOUNTANT],
    )

    def validate_email(self, value: str) -> str:
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        if User.objects.filter(username__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate(self, attrs: dict) -> dict:
        request = self.context.get("request")
        inviter = getattr(request, "user", None)
        if inviter is None or not inviter.business_id:
            raise serializers.ValidationError(
                {"detail": "You must belong to a business to invite staff."}
            )

        user = User(
            username=attrs["email"],
            email=attrs["email"],
            first_name=attrs["full_name"].strip().split(None, 1)[0],
        )
        try:
            validate_password(attrs["password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs

    @transaction.atomic
    def create(self, validated_data: dict) -> User:
        inviter = self.context["request"].user
        full_name = validated_data["full_name"].strip()
        parts = full_name.split(None, 1)
        email = validated_data["email"]
        user = User(
            username=email,
            email=email,
            first_name=parts[0],
            last_name=parts[1] if len(parts) > 1 else "",
            business=inviter.business,
            role=validated_data["role"],
        )
        user.set_password(validated_data["password"])
        user.save()
        return user

    def to_representation(self, instance: User) -> dict:
        return {"user": UserBriefSerializer(instance).data}


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login with email + password (frontend does not send username)."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop("username", None)
        self.fields["email"] = serializers.EmailField()

    @classmethod
    def get_token(cls, user: User):
        token = super().get_token(user)
        token["business_id"] = user.business_id
        token["role"] = user.role
        return token

    def validate(self, attrs: dict) -> dict:
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password", "")

        if not email:
            raise serializers.ValidationError({"email": "Email is required."})
        if not password:
            raise serializers.ValidationError({"password": "Password is required."})

        # Same message for missing / inactive / wrong password (no account enumeration).
        invalid = serializers.ValidationError(
            {"detail": "Invalid email or password."}
        )

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            # Match Django's timing mitigation for nonexistent users.
            authenticate(
                request=self.context.get("request"),
                username="__nonexistent__",
                password=password,
            )
            raise invalid

        # authenticate() also rejects inactive users without a distinct error.
        authed = authenticate(
            request=self.context.get("request"),
            username=user.username,
            password=password,
        )
        if authed is None:
            raise invalid

        if user.business_id and not user.business.is_active:
            raise invalid

        refresh = self.get_token(authed)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserBriefSerializer(authed).data,
        }
