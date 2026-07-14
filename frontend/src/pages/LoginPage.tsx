import { AuthLayout, AuthTabs, LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage inventory, billing, and VAT for your business."
    >
      <AuthTabs mode="login" />
      <LoginForm />
    </AuthLayout>
  );
}
