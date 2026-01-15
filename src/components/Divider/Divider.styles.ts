import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Divider.classes
 */
export const dividerStyles = cva("", {
  variants: {
    orientation: {
      horizontal: "h-px w-full bg-(--ui-border)",
      vertical: "w-px self-stretch bg-(--ui-border)",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});


