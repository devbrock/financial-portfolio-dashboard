import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "../Alert/Alert";
import { Divider } from "../Divider/Divider";
import { Select } from "../Select/Select";
import { Skeleton } from "../Skeleton/Skeleton";
import { Stat } from "../Stat/Stat";

describe("primitives", () => {
  it("renders alert roles by tone", () => {
    const { rerender } = render(<Alert>Info alert</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Info alert");

    rerender(<Alert tone="danger">Danger alert</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Danger alert");
  });

  it("renders a divider with orientation", () => {
    render(<Divider orientation="vertical" data-testid="divider" />);

    const divider = screen.getByTestId("divider");
    expect(divider).toHaveAttribute("role", "separator");
    expect(divider).toHaveAttribute("aria-orientation", "vertical");
  });

  it("renders a skeleton placeholder", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("renders stat content with optional subvalue", () => {
    render(<Stat label="Balance" value="$1,200" subvalue="+4%" />);

    expect(screen.getByText("Balance")).toBeInTheDocument();
    expect(screen.getByText("$1,200")).toBeInTheDocument();
    expect(screen.getByText("+4%")).toBeInTheDocument();
  });

  it("renders stat without subvalue when omitted", () => {
    render(<Stat label="Holdings" value="12" />);

    expect(screen.getByText("Holdings")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders a native select with options", () => {
    render(
      <Select defaultValue="b">
        <option value="a">Alpha</option>
        <option value="b">Beta</option>
      </Select>
    );

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("b");
    expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();
  });
});
