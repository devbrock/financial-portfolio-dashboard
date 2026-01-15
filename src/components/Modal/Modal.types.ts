import type * as React from "react";

export type ModalProps = {
  /**
   * Controls the open state.
   */
  open: boolean;
  /**
   * Called when the open state should change.
   */
  onOpenChange: (nextOpen: boolean) => void;
  /**
   * Dialog title (required for aria-labelledby).
   */
  title: React.ReactNode;
  /**
   * Dialog description (required for aria-describedby).
   */
  description: React.ReactNode;
  /**
   * Main dialog body content.
   */
  children: React.ReactNode;
  /**
   * Optional footer content (actions).
   */
  footer?: React.ReactNode;
  /**
   * Close on Escape key.
   */
  closeOnEsc?: boolean;
  /**
   * Close on overlay click.
   */
  closeOnOverlayClick?: boolean;
};


