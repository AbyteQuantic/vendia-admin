import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "../ui/error-state";

describe("ErrorState", () => {
  it("renders default error message", () => {
    render(<ErrorState />);
    expect(
      screen.getByText("Ocurrió un error al cargar los datos."),
    ).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<ErrorState message="Custom error" />);
    expect(screen.getByText("Custom error")).toBeInTheDocument();
  });

  it("renders retry button and calls onRetry", async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    const button = screen.getByRole("button", { name: "Reintentar" });
    await userEvent.click(button);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not render retry button when no handler", () => {
    render(<ErrorState />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
