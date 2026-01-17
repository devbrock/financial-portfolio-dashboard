import { cn } from "@utils/cn";
import type { DeltaPillProps } from "./DeltaPill.types";
import {
  deltaPillBaseClassName,
  deltaPillToneClassName,
} from "./DeltaPill.styles";

function Arrow(props: { direction: "up" | "down" | "flat" }) {
  const { direction } = props;
  const rotation =
    direction === "up" ? "rotate-0" : direction === "down" ? "rotate-180" : "";

  if (direction === "flat") return <span aria-hidden="true">•</span>;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("h-3.5 w-3.5", rotation)}
      fill="currentColor"
    >
      <path d="M12 4l6 6h-4v10h-4V10H6l6-6z" />
    </svg>
  );
}

/**
 * DeltaPill
 * Positive/negative delta indicator with arrow + color + text.
 */
export function DeltaPill(props: DeltaPillProps) {
  const { direction, tone, className, children, ...rest } = props;
  return (
    <span
      className={cn(
        deltaPillBaseClassName,
        deltaPillToneClassName[tone],
        className
      )}
      {...rest}
    >
      <Arrow direction={direction} />
      <span>{children}</span>
    </span>
  );
}
