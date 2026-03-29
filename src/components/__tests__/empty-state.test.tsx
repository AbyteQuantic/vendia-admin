import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "../ui/empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState title="No items" description="Create your first item." />,
    );
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Create your first item.")).toBeInTheDocument();
  });

  it("renders action button when provided", async () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        title="Empty"
        description="Nothing here"
        action={{ label: "Add item", onClick }}
      />,
    );

    const button = screen.getByRole("button", { name: "Add item" });
    expect(button).toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not render button when no action", () => {
    render(<EmptyState title="Empty" description="Nothing" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
