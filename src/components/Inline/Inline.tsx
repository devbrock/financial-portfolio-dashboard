import { Slot } from "@radix-ui/react-slot";
import { cn } from "@utils/cn";
import type { InlineProps } from "./Inline.types";
import { inlineStyles } from "./Inline.styles";

/**
 * Inline
 * Horizontal layout row with wrapping and spacing.
 */
export function Inline(props: InlineProps) {
  const { asChild, className, wrap, gap, align, justify, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(inlineStyles({ wrap, gap, align, justify }), className)}
      {...rest}
    />
  );
}
