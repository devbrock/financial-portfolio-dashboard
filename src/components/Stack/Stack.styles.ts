import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Stack.classes
 */
export const stackStyles = cva("flex flex-col", {
  variants: {
    gap: {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
  },
  defaultVariants: {
    gap: "md",
    align: "stretch",
  },
});


