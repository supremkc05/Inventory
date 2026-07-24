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
  panVatNumber: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type AuthBusiness = {
  id: number;
  name: string;
  pan_vat_number: string;
  address: string;
  phone: string;
  default_vat_rate: string;
};

export type AuthUser = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  business: AuthBusiness | null;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};
