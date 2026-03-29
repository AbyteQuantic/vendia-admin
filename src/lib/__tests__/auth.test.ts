import { describe, it, expect, beforeEach } from "vitest";
import { getAuthState, setAuthState, clearAuthState, getToken } from "../auth";
import type { AuthState } from "@/types/auth";

const mockState: AuthState = {
  token: "jwt-123",
  tenant_id: 1,
  owner_name: "Pedro",
  business_name: "Tienda Don Pedro",
  role: "tenant",
};

beforeEach(() => {
  localStorage.clear();
  document.cookie = "vendia_token=; max-age=0";
});

describe("setAuthState / getAuthState", () => {
  it("stores and retrieves auth state from localStorage", () => {
    setAuthState(mockState);
    const result = getAuthState();
    expect(result).toEqual(mockState);
  });

  it("returns null when nothing stored", () => {
    expect(getAuthState()).toBeNull();
  });

  it("returns null on corrupted JSON", () => {
    localStorage.setItem("vendia_auth", "not-json");
    expect(getAuthState()).toBeNull();
  });
});

describe("clearAuthState", () => {
  it("removes auth from localStorage", () => {
    setAuthState(mockState);
    clearAuthState();
    expect(getAuthState()).toBeNull();
  });
});

describe("getToken", () => {
  it("returns token when authenticated", () => {
    setAuthState(mockState);
    expect(getToken()).toBe("jwt-123");
  });

  it("returns null when not authenticated", () => {
    expect(getToken()).toBeNull();
  });
});
