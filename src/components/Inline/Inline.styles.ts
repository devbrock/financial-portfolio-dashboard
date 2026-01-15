import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Inline.classes
 */
export const inlineStyles = cva("flex", {
  variants: {
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
    gap: {
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      between: "justify-between",
      end: "justify-end",
      center: "justify-center",
    },
  },
  defaultVariants: {
    wrap: true,
    gap: "md",
    align: "center",
    justify: "start",
  },
});


