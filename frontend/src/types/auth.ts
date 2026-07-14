export type AuthMode = "login" | "signup";

export type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export type SignupFormValues = {
  businessName: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};
