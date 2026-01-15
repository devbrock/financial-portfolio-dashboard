import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@utils/cn";
import type { ContainerProps } from "./Container.types";
import { containerStyles } from "./Container.styles";

/**
 * Container
 * Page-width constraint + horizontal padding; centers content.
 */
export function Container(props: ContainerProps) {
  const { asChild, className, ...rest } = props;
  const Comp = asChild ? Slot : "div";

  return <Comp className={cn(containerStyles(), className)} {...rest} />;
}
