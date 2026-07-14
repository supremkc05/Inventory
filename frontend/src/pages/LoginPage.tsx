import { AuthLayout, LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="Login to continue to your account"
    >
      <LoginForm />
    </AuthLayout>
  );
}
