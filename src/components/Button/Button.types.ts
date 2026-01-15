import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { buttonStyles } from "./Button.styles";

export type ButtonVariants = VariantProps<typeof buttonStyles>;

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "disabled"
> &
  ButtonVariants & {
    /**
     * When true, show a spinner and mark the button `aria-busy`.
     * Width stays stable by reserving icon space.
     */
    loading?: boolean;
    /**
     * Optional icon before the label.
     * If the button is icon-only, prefer `IconButton` instead.
     */
    leftIcon?: React.ReactNode;
    /**
     * Optional icon after the label.
     */
    rightIcon?: React.ReactNode;
    /**
     * When true, renders the underlying element via Radix `Slot`,
     * allowing polymorphic composition without losing styles.
     */
    asChild?: boolean;
    /**
     * Disabled state.
     */
    disabled?: boolean;
    /**
     * Optional test id.
     */
    "data-testid"?: string;
  };


