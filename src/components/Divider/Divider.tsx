import * as React from "react";
import { cn } from "@utils/cn";
import type { DividerProps } from "./Divider.types";
import { dividerStyles } from "./Divider.styles";

/**
 * Divider
 * Subtle separator for content groups.
 */
export function Divider(props: DividerProps) {
  const { orientation = "horizontal", className, ...rest } = props;

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(dividerStyles({ orientation }), className)}
      {...rest}
    />
  );
}
