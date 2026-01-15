import * as React from "react";
import { cn } from "@utils/cn";
import { Portal } from "../_internal/portal";
import { getFocusableElements } from "../_internal/dom";
import type { ModalProps } from "./Modal.types";
import {
  modalContentClassName,
  modalDescriptionClassName,
  modalFooterClassName,
  modalHeaderClassName,
  modalOverlayClassName,
  modalTitleClassName,
} from "./Modal.styles";

/**
 * Modal
 * Accessible modal dialog for confirmations and forms.
 *
 * A11y notes (spec):
 * - Trap focus inside; restore focus on close.
 * - Esc closes unless explicitly disabled.
 * - `aria-labelledby` and `aria-describedby` are required (enforced via props).
 */
export function Modal(props: ModalProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    closeOnEsc = true,
    closeOnOverlayClick = true,
  } = props;

  const titleId = React.useId();
  const descriptionId = React.useId();

  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current =
      (document.activeElement instanceof HTMLElement &&
        document.activeElement) ||
      null;
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const content = contentRef.current;
    if (!content) return;
    const focusables = getFocusableElements(content);
    (focusables[0] ?? content).focus();
  }, [open]);

  React.useEffect(() => {
    if (open) return;
    previouslyFocusedRef.current?.focus?.();
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key !== "Tab") return;

      const content = contentRef.current;
      if (!content) return;
      const focusables = getFocusableElements(content);
      if (focusables.length === 0) {
        e.preventDefault();
        content.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeOnEsc, onOpenChange, open]);

  if (!open) return null;

  return (
    <Portal>
      <div
        className={modalOverlayClassName}
        onMouseDown={(e) => {
          if (!closeOnOverlayClick) return;
          if (e.target === e.currentTarget) onOpenChange(false);
        }}
      />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(modalContentClassName)}
      >
        <div className={modalHeaderClassName}>
          <div id={titleId} className={modalTitleClassName}>
            {title}
          </div>
          <div id={descriptionId} className={modalDescriptionClassName}>
            {description}
          </div>
        </div>

        <div className="space-y-4">{children}</div>

        {footer ? <div className={modalFooterClassName}>{footer}</div> : null}
      </div>
    </Portal>
  );
}
