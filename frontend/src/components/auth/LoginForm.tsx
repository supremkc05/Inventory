import { AuthInput } from "@/components/auth/AuthInput";
import type { LoginFormValues } from "@/types/auth";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
    remember: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!values.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Enter a valid email";
    }
    if (!values.password) next.password = "Password is required";
    else if (values.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Frontend-only for now — wire to JWT auth later
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    onSuccess?.();
    navigate("/pricing");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <AuthInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@business.com"
        value={values.email}
        error={errors.email}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
      />

      <AuthInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={values.password}
        error={errors.password}
        onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            checked={values.remember}
            onChange={(e) =>
              setValues((v) => ({ ...v, remember: e.target.checked }))
            }
          />
          Remember me
        </label>
        <button
          type="button"
          className="font-medium text-red-600 hover:text-red-700"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Signing in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-slate-600">
        New to DokanDaftar?{" "}
        <Link to="/signup" className="font-semibold text-red-600 hover:text-red-700">
          Create an account
        </Link>
      </p>
    </form>
  );
}
