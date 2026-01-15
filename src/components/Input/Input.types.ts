import type * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { inputStyles } from "./Input.styles";

export type InputVariants = VariantProps<typeof inputStyles>;

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> &
  InputVariants & {
    /**
     * Optional test id.
     */
    "data-testid"?: string;
  };


