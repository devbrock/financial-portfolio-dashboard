import type * as React from "react";

export type TabsProps = {
  /**
   * Selected tab value (controlled).
   */
  value?: string;
  /**
   * Default selected tab value (uncontrolled).
   */
  defaultValue: string;
  /**
   * Called when the selected tab changes.
   */
  onValueChange?: (nextValue: string) => void;
  /**
   * Tabs content.
   */
  children: React.ReactNode;
};

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export type TabsTriggerProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "type"
> & {
  value: string;
  disabled?: boolean;
};

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};


