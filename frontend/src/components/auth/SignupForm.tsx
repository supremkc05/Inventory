import { signup } from "@/api/auth";
import { AuthInput } from "@/components/auth/AuthInput";
import {
  GoogleIcon,
  IdCardIcon,
  LockIcon,
  MailIcon,
  StoreIcon,
  UserIcon,
} from "@/components/auth/AuthIcons";
import { ApiError, mapDrfErrors } from "@/lib/api";
import type { SignupFormValues } from "@/types/auth";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

export function SignupForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<SignupFormValues>({
    businessName: "",
    fullName: "",
    email: "",
    panVatNumber: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormValues | "form", string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof SignupFormValues>(
    key: K,
    value: SignupFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next: typeof errors = {};
    if (!values.businessName.trim()) {
      next.businessName = "Business name is required";
    }
    if (!values.fullName.trim()) next.fullName = "Your name is required";
    if (!values.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Enter a valid email";
    }
    const pan = values.panVatNumber.trim();
    if (!pan) next.panVatNumber = "PAN/VAT number is required";
    else if (!/^\d{9}$/.test(pan)) {
      next.panVatNumber = "PAN must be exactly 9 digits";
    }
    if (!values.password) next.password = "Password is required";
    else if (values.password.length < 8) {
      next.password = "Use at least 8 characters";
    }
    if (values.confirmPassword !== values.password) {
      next.confirmPassword = "Passwords do not match";
    }
    if (!values.acceptTerms) {
      next.acceptTerms = "Accept the terms to continue";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      await signup({
        business_name: values.businessName.trim(),
        full_name: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        confirm_password: values.confirmPassword,
        pan_vat_number: values.panVatNumber.trim(),
      });
      // Account created — user must log in before opening the app
      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          email: values.email.trim().toLowerCase(),
        },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const mapped = mapDrfErrors(err.body, {
          business_name: "businessName",
          full_name: "fullName",
          email: "email",
          password: "password",
          confirm_password: "confirmPassword",
          pan_vat_number: "panVatNumber",
        });
        setErrors({
          ...mapped,
          form:
            mapped.form ??
            (Object.keys(mapped).length === 0
              ? "Could not create account"
              : undefined),
        });
      } else {
        setErrors({ form: "Could not reach the server. Is the API running?" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <AuthInput
          label="Business name"
          name="businessName"
          autoComplete="organization"
          placeholder="Kirana Store"
          value={values.businessName}
          error={errors.businessName}
          icon={<StoreIcon className="h-4 w-4" />}
          className="py-2.5"
          onChange={(e) => update("businessName", e.target.value)}
        />
        <AuthInput
          label="Your name"
          name="fullName"
          autoComplete="name"
          placeholder="Your name"
          value={values.fullName}
          error={errors.fullName}
          icon={<UserIcon className="h-4 w-4" />}
          className="py-2.5"
          onChange={(e) => update("fullName", e.target.value)}
        />
      </div>

      <AuthInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Enter your email"
        value={values.email}
        error={errors.email}
        icon={<MailIcon className="h-4 w-4" />}
        className="py-2.5"
        onChange={(e) => update("email", e.target.value)}
      />

      <AuthInput
        label="PAN / VAT number"
        name="panVatNumber"
        inputMode="numeric"
        autoComplete="off"
        placeholder="9-digit PAN"
        maxLength={9}
        value={values.panVatNumber}
        error={errors.panVatNumber}
        icon={<IdCardIcon className="h-4 w-4" />}
        className="py-2.5"
        onChange={(e) =>
          update("panVatNumber", e.target.value.replace(/\D/g, "").slice(0, 9))
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <AuthInput
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Password"
          value={values.password}
          error={errors.password}
          icon={<LockIcon className="h-4 w-4" />}
          showPasswordToggle
          className="py-2.5"
          onChange={(e) => update("password", e.target.value)}
        />
        <AuthInput
          label="Confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          icon={<LockIcon className="h-4 w-4" />}
          showPasswordToggle
          className="py-2.5"
          onChange={(e) => update("confirmPassword", e.target.value)}
        />
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            checked={values.acceptTerms}
            onChange={(e) => update("acceptTerms", e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <a href="#" className="font-medium text-red-600 hover:text-red-700">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium text-red-600 hover:text-red-700">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.acceptTerms ? (
          <span className="mt-1 block text-xs text-red-600">
            {errors.acceptTerms}
          </span>
        ) : null}
      </div>

      {errors.form ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-red-600 px-4 py-3 text-[15px] font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Creating account…" : "Sign up"}
      </button>

      <div className="relative py-0.5 text-center text-sm text-slate-400">
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

      <p className="pt-1 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-red-600 hover:text-red-700"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
