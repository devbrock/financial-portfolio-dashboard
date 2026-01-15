import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { inlineStyles } from "./Inline.styles";

export type InlineVariants = VariantProps<typeof inlineStyles>;

export type InlineProps = React.HTMLAttributes<HTMLDivElement> &
  InlineVariants & {
    /**
     * When true, renders the underlying element via Radix `Slot`,
     * allowing polymorphic composition without losing styles.
     */
    asChild?: boolean;
  };


