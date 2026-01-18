import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Modal } from "../Modal/Modal";

describe("Modal", () => {
  it("closes on overlay click when enabled", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal
        open
        onOpenChange={onOpenChange}
        title="Confirm"
        description="Are you sure?"
      >
        Content
      </Modal>
    );

    const overlay = document.body.querySelector(".inset-0");
    expect(overlay).toBeInstanceOf(HTMLElement);

    fireEvent.mouseDown(overlay as HTMLElement);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on escape when enabled", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal
        open
        onOpenChange={onOpenChange}
        title="Confirm"
        description="Are you sure?"
      >
        Content
      </Modal>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ignores overlay and escape when disabled", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal
        open
        onOpenChange={onOpenChange}
        title="Confirm"
        description="Are you sure?"
        closeOnEsc={false}
        closeOnOverlayClick={false}
      >
        Content
      </Modal>
    );

    const overlay = document.body.querySelector(".inset-0");
    expect(overlay).toBeInstanceOf(HTMLElement);

    fireEvent.mouseDown(overlay as HTMLElement);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("traps focus within the modal on tab navigation", () => {
    render(
      <Modal
        open
        onOpenChange={() => undefined}
        title="Confirm"
        description="Are you sure?"
      >
        <button type="button">First</button>
        <button type="button">Second</button>
      </Modal>
    );

    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });

    second.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(first).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(second).toHaveFocus();
  });
});
