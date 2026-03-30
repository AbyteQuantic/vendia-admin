"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AuthState, LoginRequest, AuthResponse } from "@/types/auth";
import { getAuthState, setAuthState, clearAuthState } from "@/lib/auth";
import { apiPost } from "@/lib/api";

export function useAuth() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState | null>(() => getAuthState());
  const loading = false;

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const res = await apiPost<AuthResponse>("/api/auth/login", credentials);
      const state: AuthState = {
        token: res.token,
        tenant_id: res.tenant_id,
        owner_name: res.owner_name,
        business_name: res.business_name,
        role: res.role ?? "tenant",
      };
      setAuthState(state);
      setAuth(state);
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(() => {
    clearAuthState();
    setAuth(null);
    router.push("/login");
  }, [router]);

  return {
    auth,
    isAuthenticated: !!auth?.token,
    loading,
    login,
    logout,
  };
}
