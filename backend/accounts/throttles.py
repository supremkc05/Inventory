"""Rate limits for auth endpoints (brute-force / credential stuffing)."""

from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle


class AuthLoginIPThrottle(AnonRateThrottle):
    """Limit login attempts per client IP."""

    scope = "auth_login"


class AuthLoginEmailThrottle(SimpleRateThrottle):
    """Limit login attempts per email address."""

    scope = "auth_login_email"

    def get_cache_key(self, request, view):
        email = request.data.get("email")
        if not email or not isinstance(email, str):
            return None
        ident = email.strip().lower()
        if not ident:
            return None
        return self.cache_format % {"scope": self.scope, "ident": ident}


class AuthSignupIPThrottle(AnonRateThrottle):
    """Limit signup attempts per client IP."""

    scope = "auth_signup"


class AuthRefreshIPThrottle(AnonRateThrottle):
    """Limit refresh attempts per client IP."""

    scope = "auth_refresh"