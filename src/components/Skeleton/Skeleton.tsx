import * as React from "react";
import { cn } from "@utils/cn";
import type { SkeletonProps } from "./Skeleton.types";
import { skeletonClassName } from "./Skeleton.styles";

/**
 * Skeleton
 * Loading placeholder blocks for cards/table/chart.
 *
 * A11y notes (spec):
 * - Mark parent region `aria-busy=true` while loading.
 * - Skeleton itself should be `aria-hidden=true`.
 */
export function Skeleton(props: SkeletonProps) {
  const { className, ...rest } = props;
  return (
    <div
      aria-hidden="true"
      className={cn(skeletonClassName, className)}
      {...rest}
    />
  );
}
