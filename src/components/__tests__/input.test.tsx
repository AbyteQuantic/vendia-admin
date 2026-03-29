import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "../ui/input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input id="name" label="Nombre" />);
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input id="email" label="Email" error="Invalid email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("applies error styles when error is present", () => {
    render(<Input id="test" error="Required" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red-400");
  });
});
