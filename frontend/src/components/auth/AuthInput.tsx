import { EyeIcon, EyeOffIcon } from "@/components/auth/AuthIcons";
import { cn } from "@/lib/cn";
import {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label?: string;
  error?: string;
  icon?: ReactNode;
  showPasswordToggle?: boolean;
  className?: string;
};

export function AuthInput({
  label,
  error,
  id,
  icon,
  showPasswordToggle,
  type = "text",
  className,
  ...props
}: AuthInputProps) {
  const inputId = id ?? props.name;
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password" || showPasswordToggle;
  const resolvedType = isPassword && visible ? "text" : type;

  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </span>
      ) : null}
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          type={resolvedType}
          className={cn(
            "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100",
            icon ? "pl-11" : undefined,
            showPasswordToggle ? "pr-11" : undefined,
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : undefined,
            className,
          )}
          {...props}
        />
        {showPasswordToggle ? (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-600"
            onClick={() => setVisible((v) => !v)}
            tabIndex={-1}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        ) : null}
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      ) : null}
    </label>
  );
}
