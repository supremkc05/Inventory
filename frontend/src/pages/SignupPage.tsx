import { AuthLayout, SignupForm } from "@/components/auth";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create account"
      subtitle="Start managing your dokan in minutes"
    >
      <SignupForm />
    </AuthLayout>
  );
}
