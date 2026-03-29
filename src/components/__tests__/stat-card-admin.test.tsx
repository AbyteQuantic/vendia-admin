import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCardAdmin } from "../admin/stat-card-admin";

describe("StatCardAdmin", () => {
  it("renders label and value", () => {
    render(
      <StatCardAdmin
        icon={<span data-testid="icon" />}
        label="Tenderos"
        value="342"
      />,
    );
    expect(screen.getByText("Tenderos")).toBeInTheDocument();
    expect(screen.getByText("342")).toBeInTheDocument();
  });

  it("renders change indicator when provided", () => {
    render(
      <StatCardAdmin
        icon={<span />}
        label="Activos"
        value="187"
        change="+5%"
        changeDirection="up"
      />,
    );
    expect(screen.getByText(/\+5%/)).toBeInTheDocument();
  });

  it("does not render change when not provided", () => {
    const { container } = render(
      <StatCardAdmin icon={<span />} label="Test" value="0" />,
    );
    expect(container.querySelector(".text-green-600")).toBeNull();
    expect(container.querySelector(".text-red-600")).toBeNull();
  });
});
