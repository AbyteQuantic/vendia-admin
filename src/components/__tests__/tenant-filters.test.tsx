import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TenantFilters } from "../admin/tenant-filters";

describe("TenantFilters", () => {
  const defaultProps = {
    search: "",
    onSearchChange: vi.fn(),
    subscriptionFilter: "",
    onSubscriptionFilterChange: vi.fn(),
    statusFilter: "",
    onStatusFilterChange: vi.fn(),
  };

  it("renders search input", () => {
    render(<TenantFilters {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
  });

  it("renders subscription filter buttons", () => {
    render(<TenantFilters {...defaultProps} />);
    expect(screen.getByText("Trial")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
    expect(screen.getByText("Suspendido")).toBeInTheDocument();
  });

  it("renders online/offline filter", () => {
    render(<TenantFilters {...defaultProps} />);
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing", async () => {
    const onSearchChange = vi.fn();
    render(<TenantFilters {...defaultProps} onSearchChange={onSearchChange} />);
    await userEvent.type(screen.getByPlaceholderText(/Buscar/i), "Pedro");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("calls onSubscriptionFilterChange when clicking filter", async () => {
    const fn = vi.fn();
    render(<TenantFilters {...defaultProps} onSubscriptionFilterChange={fn} />);
    await userEvent.click(screen.getByText("Activo"));
    expect(fn).toHaveBeenCalledWith("active");
  });
});
