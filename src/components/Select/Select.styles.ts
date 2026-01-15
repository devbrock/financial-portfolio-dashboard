import { cva } from "class-variance-authority";

/**
 * Spec: `design_system.json` -> components.controls.Select.classes.base
 */
export const selectStyles = cva(
  [
    // Base
    "w-full h-10 rounded-xl border border-(--ui-border) bg-(--ui-bg)",
    "px-3 pr-10 text-sm text-(--ui-text)",
    // Match input focus behavior
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-focus)",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg)",
    // Hide the native arrow; we render our own chevron for consistent alignment.
    "appearance-none",
    // Disabled parity with Input
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" ")
);
