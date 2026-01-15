import type * as React from "react";

export type ChipProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  /**
   * Selected state (toggles styling) and should be reflected via `aria-pressed`.
   */
  selected?: boolean;
  /**
   * Disabled state.
   */
  disabled?: boolean;
};


