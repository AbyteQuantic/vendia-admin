import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiGet, apiPost, apiPatch, ApiClientError } from "../api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("../auth", () => ({
  getToken: vi.fn(() => "test-jwt-token"),
  clearAuthState: vi.fn(),
}));

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("apiGet", () => {
  it("sends GET request with auth header", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: "ok" }));

    const result = await apiGet<{ data: string }>("/api/v1/products");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/products"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-jwt-token",
        }),
      }),
    );
    expect(result).toEqual({ data: "ok" });
  });
});

describe("apiPost", () => {
  it("sends POST with JSON body", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 1 }, 201));

    const result = await apiPost<{ id: number }>("/api/v1/products", {
      name: "Test",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/products"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(result).toEqual({ id: 1 });
  });
});

describe("apiPatch", () => {
  it("sends PATCH with JSON body", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ updated: true }));

    await apiPatch("/api/v1/products/1", { stock: 50 });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/products/1"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ stock: 50 }),
      }),
    );
  });
});

describe("error handling", () => {
  it("throws ApiClientError on 401", async () => {
    const locationHref = vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      href: "/dashboard",
    });
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "/dashboard" },
    });

    mockFetch.mockResolvedValueOnce(jsonResponse({}, 401));

    await expect(apiGet("/api/v1/products")).rejects.toThrow("Sesión expirada");

    locationHref.mockRestore();
  });

  it("throws ApiClientError with message on 400+", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: "Bad request" }, 400),
    );

    await expect(apiPost("/api/v1/products", {})).rejects.toThrow(
      "Bad request",
    );
  });

  it("throws ApiClientError instance", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: "Not found" }, 404),
    );

    try {
      await apiGet("/api/v1/products/999");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiClientError);
      expect((err as ApiClientError).status).toBe(404);
    }
  });
});
