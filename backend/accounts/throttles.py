"""Rate limits for auth endpoints (brute-force / credential stuffing)."""

from rest_framework.throttling import SimpleRateThrottle


class AuthLoginIPThrottle(SimpleRateThrottle):
    """Limit login attempts per client IP."""

    scope = "auth_login"


class AuthLoginEmailThrottle(SimpleRateThrottle):
    """
    Limit login attempts per email address.

    Stops credential stuffing from many IPs against one account.
    Skips when email is missing (field validation handles that).
    """

    scope = "auth_login_email"

    def get_cache_key(self, request, view):
        email = request.data.get("email")
        if not email or not isinstance(email, str):
            return None
        ident = email.strip().lower()
        if not ident:
            return None
        return self.cache_format % {"scope": self.scope, "ident": ident}


class AuthSignupIPThrottle(SimpleRateThrottle):
    """Limit signup attempts per client IP."""

    scope = "auth_signup"


class AuthRefreshIPThrottle(SimpleRateThrottle):
    """Limit refresh attempts per client IP."""

    scope = "auth_refresh"
