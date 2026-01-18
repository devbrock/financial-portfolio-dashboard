import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Tabs/Tabs";

describe("Tabs", () => {
  it("switches panels on click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="details">Details panel</TabsContent>
      </Tabs>
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const detailsTab = screen.getByRole("tab", { name: "Details" });

    const overviewPanel = screen.getByText("Overview panel");
    const detailsPanel = screen.getByText("Details panel");

    expect(overviewTab).toHaveAttribute("aria-selected", "true");
    expect(detailsTab).toHaveAttribute("aria-selected", "false");
    expect(overviewPanel).not.toHaveAttribute("hidden");
    expect(detailsPanel).toHaveAttribute("hidden");

    await user.click(detailsTab);

    expect(detailsTab).toHaveAttribute("aria-selected", "true");
    expect(overviewTab).toHaveAttribute("aria-selected", "false");
    expect(detailsPanel).not.toHaveAttribute("hidden");
  });

  it("moves focus with arrow keys and activates on enter", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="details">Details panel</TabsContent>
      </Tabs>
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const detailsTab = screen.getByRole("tab", { name: "Details" });

    overviewTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(detailsTab).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(detailsTab).toHaveAttribute("aria-selected", "true");
  });

  it("moves focus with arrow left and up", async () => {
    const user = userEvent.setup();
    render(
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="details">Details panel</TabsContent>
      </Tabs>
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const detailsTab = screen.getByRole("tab", { name: "Details" });

    detailsTab.focus();
    await user.keyboard("{ArrowLeft}");
    expect(overviewTab).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(detailsTab).toHaveFocus();
  });

  it("ignores clicks on disabled tabs", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details" disabled>
            Details
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="details">Details panel</TabsContent>
      </Tabs>
    );

    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    const detailsTab = screen.getByRole("tab", { name: "Details" });

    await user.click(detailsTab);

    expect(overviewTab).toHaveAttribute("aria-selected", "true");
    expect(detailsTab).toHaveAttribute("aria-selected", "false");

    rerender(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="details">Details panel</TabsContent>
      </Tabs>
    );
  });

  it("registers duplicate values without crashing", () => {
    render(
      <Tabs defaultValue="dup">
        <TabsList>
          <TabsTrigger value="dup">First</TabsTrigger>
          <TabsTrigger value="dup">Second</TabsTrigger>
        </TabsList>
        <TabsContent value="dup">Duplicate panel</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Duplicate panel")).toBeInTheDocument();
  });

  it("honors default-prevented click handlers", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    });

    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details" onClick={onClick}>
            Details
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
        <TabsContent value="details">Details panel</TabsContent>
      </Tabs>
    );

    await user.click(screen.getByRole("tab", { name: "Details" }));

    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
