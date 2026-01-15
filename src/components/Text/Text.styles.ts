import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.primitives.Text.classes
 */
export const textStyles = cva("font-(--font-brand-secondary)", {
  variants: {
    size: {
      body: "text-base leading-7",
      sm: "text-sm leading-6",
      caption: "text-xs leading-5",
    },
    tone: {
      default: "text-(--ui-text)",
      muted: "text-(--ui-text-muted)",
      subtle: "text-(--ui-text-subtle)",
      inverse: "text-(--ui-inverse-text)",
    },
  },
  defaultVariants: {
    size: "body",
    tone: "default",
  },
});


