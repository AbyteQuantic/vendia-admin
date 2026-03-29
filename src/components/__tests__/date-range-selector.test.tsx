import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateRangeSelector } from "../admin/date-range-selector";

describe("DateRangeSelector", () => {
  it("renders three options", () => {
    render(<DateRangeSelector value={7} onChange={vi.fn()} />);
    expect(screen.getByText("7 días")).toBeInTheDocument();
    expect(screen.getByText("30 días")).toBeInTheDocument();
    expect(screen.getByText("90 días")).toBeInTheDocument();
  });

  it("highlights the active option", () => {
    render(<DateRangeSelector value={30} onChange={vi.fn()} />);
    const btn30 = screen.getByText("30 días");
    expect(btn30.className).toContain("bg-white");
  });

  it("calls onChange when clicking a different option", async () => {
    const onChange = vi.fn();
    render(<DateRangeSelector value={7} onChange={onChange} />);
    await userEvent.click(screen.getByText("90 días"));
    expect(onChange).toHaveBeenCalledWith(90);
  });
});
