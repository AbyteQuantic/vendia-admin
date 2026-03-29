export interface LoginRequest {
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tenant_id: number;
  owner_name: string;
  business_name: string;
  role?: "tenant" | "super_admin";
}

export interface AuthState {
  token: string;
  tenant_id: number;
  owner_name: string;
  business_name: string;
  role: "tenant" | "super_admin";
}
