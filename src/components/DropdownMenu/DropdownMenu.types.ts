import type * as React from 'react';

export type DropdownMenuProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (next: boolean) => void;
  children: React.ReactNode;
};

export type DropdownMenuTriggerProps = {
  /**
   * Render trigger via Slot (recommended so you can use Button/IconButton).
   */
  asChild?: boolean;
  children: React.ReactNode;
};

export type DropdownMenuContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Optional width override.
   */
  minWidth?: number;
  /**
   * Horizontal alignment relative to trigger.
   */
  align?: 'start' | 'end';
  /**
   * Vertical offset from trigger in pixels.
   */
  sideOffset?: number;
};

export type DropdownMenuItemProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  inset?: boolean;
};
