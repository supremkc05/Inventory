import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.14 0-7.5 2.11-7.5 4.72V20.5h15v-1.53c0-2.61-3.36-4.72-7.5-4.72Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M17.25 10.5h-.75V8.25a4.5 4.5 0 1 0-9 0V10.5H6.75A1.75 1.75 0 0 0 5 12.25v6A1.75 1.75 0 0 0 6.75 20h10.5A1.75 1.75 0 0 0 19 18.25v-6a1.75 1.75 0 0 0-1.75-1.75Zm-7.5-2.25a2.25 2.25 0 1 1 4.5 0V10.5h-4.5V8.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function StoreIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M4 8.5 5.6 4.8A1.5 1.5 0 0 1 7 4h10a1.5 1.5 0 0 1 1.4.8L20 8.5V10a2 2 0 0 1-2 2v6.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18.5V12a2 2 0 0 1-2-2V8.5Zm2.6-2.5L5.6 9H9V6H6.6ZM11 6v3h2V6h-2Zm5.4 0H15v3h3.4l-1-3ZM8 18h8v-6H8v6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IdCardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M3.75 5.25A1.75 1.75 0 0 1 5.5 3.5h13a1.75 1.75 0 0 1 1.75 1.75v13a1.75 1.75 0 0 1-1.75 1.75h-13A1.75 1.75 0 0 1 3.75 18.25v-13Zm1.5.25v12.5h13.5V5.5H5.25ZM7.5 9.25h4.5v1.5H7.5v-1.5Zm0 3.5h6v1.5h-6v-1.5Zm9-2.25a1.75 1.75 0 1 1-1.75-1.75A1.75 1.75 0 0 1 16.5 10.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h10.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V6.75Zm2.4-.75 5.1 3.82L17.1 6H6.9Zm12.1 1.62-5.73 4.3a1.5 1.5 0 0 1-1.74 0L5.8 7.62v9.63c0 .41.34.75.75.75h10.5c.41 0 .75-.34.75-.75V7.62Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 5.25C7.2 5.25 3.15 8.25 1.5 12c1.65 3.75 5.7 6.75 10.5 6.75S20.85 15.75 22.5 12C20.85 8.25 16.8 5.25 12 5.25Zm0 11.25A4.5 4.5 0 1 1 16.5 12 4.5 4.5 0 0 1 12 16.5Zm0-7.2A2.7 2.7 0 1 0 14.7 12 2.7 2.7 0 0 0 12 9.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M3.22 3.22a.75.75 0 0 0-1.06 1.06l2.1 2.1C2.7 7.6 1.8 9.2 1.5 12c1.65 3.75 5.7 6.75 10.5 6.75a11.7 11.7 0 0 0 5.2-1.2l3.58 3.58a.75.75 0 1 0 1.06-1.06L3.22 3.22ZM12 16.5a4.5 4.5 0 0 1-4.4-5.48l1.58 1.58A2.7 2.7 0 0 0 12 14.7c.2 0 .4-.02.58-.06l1.58 1.58c-.66.18-1.4.28-2.16.28Zm8.95-3.68c-.34.78-.8 1.5-1.34 2.14l-1.14-1.14c.28-.4.5-.84.66-1.32C18.35 10.35 15.4 8.1 12 8.1c-.42 0-.84.04-1.24.1L9.38 6.82A11.8 11.8 0 0 1 12 6.4c4.8 0 8.85 3 10.5 6.75-.22.5-.5.97-.82 1.42l-.73-.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.76 9.76 0 0 0 12 2.25Zm0 1.5a8.2 8.2 0 0 1 2.1.28 14.3 14.3 0 0 0-1.4 3.47H11.3A14.3 14.3 0 0 0 9.9 4.03 8.2 8.2 0 0 1 12 3.75Zm-3.55.8c.4 1.2.9 2.35 1.45 3.45H6.7A8.28 8.28 0 0 1 8.45 4.55Zm7.1 0A8.28 8.28 0 0 1 17.3 8h-3.2c.55-1.1 1.05-2.25 1.45-3.45ZM5.55 9.5h3.55c.15.95.25 1.95.25 3s-.1 2.05-.25 3H5.55A8.26 8.26 0 0 1 4.5 12a8.26 8.26 0 0 1 1.05-2.5Zm4.95 0h3c.16.98.25 1.98.25 3s-.09 2.02-.25 3h-3c-.16-.98-.25-1.98-.25-3s.09-2.02.25-3Zm4.45 0H18.45A8.26 8.26 0 0 1 19.5 12a8.26 8.26 0 0 1-1.05 2.5h-3.55c.15-.95.25-1.95.25-3s-.1-2.05-.25-3ZM6.7 16h3.2c-.55 1.1-1.05 2.25-1.45 3.45A8.28 8.28 0 0 1 6.7 16Zm4.6 0h1.4c.38 1.28.86 2.48 1.4 3.47A8.2 8.2 0 0 1 12 20.25a8.2 8.2 0 0 1-2.1-.28A14.3 14.3 0 0 0 11.3 16Zm4.4 0h3.2a8.28 8.28 0 0 1-1.75 3.45c-.4-1.2-.9-2.35-1.45-3.45Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M4.5 19.5h15V21H3V3h1.5v16.5Zm3.75-3.75h1.5V9h-1.5v6.75Zm4.5 0h1.5V6h-1.5v9.75Zm4.5 0h1.5V12h-1.5v3.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 2.6 3.75 7v10L12 21.4 20.25 17V7L12 2.6Zm0 1.75 6.3 3.35L12 11.05 5.7 7.7 12 4.35ZM5.25 9.05l5.5 2.9v7.35l-5.5-2.95V9.05Zm7.25 10.25v-7.35l5.5-2.9v7.3l-5.5 2.95Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.2 2.9-7.1 0-.7-.1-1.3-.2-1.9H12Z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3 5.7 15l-2.5 1.9A9.96 9.96 0 0 0 12 22c2.7 0 5-0.9 6.7-2.4l-3.1-2.4c-.9.6-2 1-3.6 1-2.8 0-5.1-1.8-6-4.3l-.4-.6Z"
      />
      <path
        fill="#4A90E2"
        d="M3.2 5.1A9.96 9.96 0 0 0 2 12c0 1.6.4 3.1 1.1 4.4l3.5-2.7c-.3-.8-.4-1.6-.4-1.7 0-.6.1-1.2.3-1.7L3.2 5.1Z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.8c1.5 0 2.8.5 3.9 1.5l2.9-2.9C16.9 2.8 14.7 2 12 2 8.2 2 4.9 4.1 3.2 7.1l3.3 2.6C7 5.9 9.2 5.8 12 5.8Z"
      />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M6.5 9.5 12 15l5.5-5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
