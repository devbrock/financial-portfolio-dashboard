import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@utils/cn";
import type { StackProps } from "./Stack.types";
import { stackStyles } from "./Stack.styles";

/**
 * Stack
 * Vertical layout with consistent spacing.
 */
export function Stack(props: StackProps) {
  const { asChild, className, gap, align, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp className={cn(stackStyles({ gap, align }), className)} {...rest} />
  );
}
