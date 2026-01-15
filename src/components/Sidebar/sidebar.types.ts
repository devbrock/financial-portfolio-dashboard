import type * as React from "react";

export type SidebarCollapsible = "offcanvas" | "icon";

export type SidebarProviderProps = {
  children: React.ReactNode;
  /**
   * Uncontrolled initial open state.
   * @defaultValue true
   */
  defaultOpen?: boolean;
  /**
   * Controlled open state.
   */
  open?: boolean;
  /**
   * Called when open state changes.
   */
  onOpenChange?: (open: boolean) => void;
};

export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  /**
   * Controls the collapse behavior.
   * - "offcanvas": hide/show the sidebar.
   * - "icon": collapse to a narrow icon rail.
   * @defaultValue "icon"
   */
  collapsible?: SidebarCollapsible;
  /**
   * Sidebar width when expanded.
   * @defaultValue 280
   */
  width?: number;
  /**
   * Sidebar width when collapsed to icons.
   * @defaultValue 72
   */
  iconWidth?: number;
};

export type SidebarTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * Optional label for the trigger.
   */
  ariaLabel?: string;
};


