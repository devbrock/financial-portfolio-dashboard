import { forwardRef } from "react";
import { cn } from "@utils/cn";
import type { InputProps } from "./Input.types";
import { inputStyles } from "./Input.styles";

/**
 * Input
 * Text input styled to match the design system.
 *
 * A11y notes (spec):
 * - `id` must be set and label must reference it (handled by your FormField wrapper).
 * - When error: set `aria-invalid=true` and connect error text via `aria-describedby`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  props,
  ref
) {
  const { className, size, ...rest } = props;
  return (
    <input
      ref={ref}
      className={cn(inputStyles({ size }), className)}
      {...rest}
    />
  );
});
