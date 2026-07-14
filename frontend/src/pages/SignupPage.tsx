import { AuthLayout, AuthTabs, SignupForm } from "@/components/auth";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your business in minutes — Nepali fiscal year and VAT ready."
    >
      <AuthTabs mode="signup" />
      <SignupForm />
    </AuthLayout>
  );
}
