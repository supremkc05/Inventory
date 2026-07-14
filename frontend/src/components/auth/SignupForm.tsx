import { AuthInput } from "@/components/auth/AuthInput";
import type { SignupFormValues } from "@/types/auth";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

export function SignupForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<SignupFormValues>({
    businessName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormValues, string>>
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
    // Frontend-only — create Business + User via API later
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    navigate("/pricing");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <AuthInput
        label="Business name"
        name="businessName"
        autoComplete="organization"
        placeholder="Shree Kirana Store"
        value={values.businessName}
        error={errors.businessName}
        onChange={(e) => update("businessName", e.target.value)}
      />

      <AuthInput
        label="Your name"
        name="fullName"
        autoComplete="name"
        placeholder="Ram Bahadur"
        value={values.fullName}
        error={errors.fullName}
        onChange={(e) => update("fullName", e.target.value)}
      />

      <AuthInput
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="owner@store.com"
        value={values.email}
        error={errors.email}
        onChange={(e) => update("email", e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AuthInput
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          onChange={(e) => update("password", e.target.value)}
        />
        <AuthInput
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirmPassword}
          error={errors.confirmPassword}
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

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-red-600 hover:text-red-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
