import { login } from "@/api/auth";
import { AuthInput } from "@/components/auth/AuthInput";
import { GoogleIcon, LockIcon, MailIcon } from "@/components/auth/AuthIcons";
import { ApiError, mapDrfErrors } from "@/lib/api";
import { saveTokens } from "@/lib/authStorage";
import type { LoginFormValues } from "@/types/auth";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type LoginFormProps = {
  onSuccess?: () => void;
};

type FieldErrors = Partial<Record<keyof LoginFormValues | "form", string>>;

type LoginLocationState = {
  from?: string;
  registered?: boolean;
  email?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as LoginLocationState | null) ?? null;

  const [values, setValues] = useState<LoginFormValues>({
    email: locationState?.email ?? "",
    password: "",
    remember: true,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [justRegistered] = useState(Boolean(locationState?.registered));

  const setField = <K extends keyof LoginFormValues>(
    key: K,
    value: LoginFormValues[K],
  ) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((prev) => {
      if (!prev[key] && !prev.form) return prev;
      const next = { ...prev };
      delete next[key];
      delete next.form;
      return next;
    });
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const email = values.email.trim();

    if (!email) next.email = "Email is required";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address";

    if (!values.password) next.password = "Password is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      const data = await login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      saveTokens(data.access, data.refresh);
      onSuccess?.();
      const nextPath =
        locationState?.from && locationState.from !== "/login"
          ? locationState.from
          : "/dashboard";
      navigate(nextPath, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const mapped = mapDrfErrors(err.body, {
          email: "email",
          password: "password",
        });

        if (mapped.email || mapped.password) {
          setErrors(mapped);
        } else {
          setErrors({
            form:
              mapped.form ??
              "Login failed. Check your email and password.",
          });
        }
      } else {
        setErrors({ form: "Could not reach the server. Is the API running?" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {justRegistered ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Account created. Please log in to continue.
        </p>
      ) : null}

      <AuthInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Enter your email"
        value={values.email}
        error={errors.email}
        icon={<MailIcon className="h-4 w-4" />}
        onChange={(e) => setField("email", e.target.value)}
        onBlur={() => {
          const email = values.email.trim();
          if (!email) return;
          if (!EMAIL_RE.test(email)) {
            setErrors((prev) => ({
              ...prev,
              email: "Enter a valid email address",
            }));
          }
        }}
      />

      <div>
        <AuthInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          error={errors.password}
          icon={<LockIcon className="h-4 w-4" />}
          showPasswordToggle
          onChange={(e) => setField("password", e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Forgot password?
          </button>
        </div>
      </div>

      {errors.form ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 w-full rounded-lg bg-red-600 px-4 py-3 text-[15px] font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Logging in…" : "Login"}
      </button>

      <div className="relative py-1 text-center text-sm text-slate-400">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
        <span className="relative bg-white px-3">or</span>
      </div>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-[11px] text-sm font-medium text-slate-700 transition hover:border-red-200 hover:bg-rose-50"
      >
        <GoogleIcon className="h-5 w-5" />
        Continue with Google
      </button>

      <p className="pt-2 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-red-600 hover:text-red-700"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
