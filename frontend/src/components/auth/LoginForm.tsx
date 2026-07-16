import { AuthInput } from "@/components/auth/AuthInput";
import { GoogleIcon, LockIcon, MailIcon } from "@/components/auth/AuthIcons";
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
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormValues, string>>
  >({});
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
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    onSuccess?.();
    navigate("/dashboard");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <AuthInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Enter your email"
        value={values.email}
        error={errors.email}
        icon={<MailIcon className="h-4 w-4" />}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
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
          onChange={(e) =>
            setValues((v) => ({ ...v, password: e.target.value }))
          }
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
