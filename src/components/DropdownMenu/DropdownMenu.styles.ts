/**
 * Spec: `design_system.json` -> components.navigationAndOverlays.DropdownMenu.classes
 */
export const dropdownMenuContentClassName =
  [
    "min-w-48 rounded-xl border border-(--ui-border) bg-(--ui-bg) text-(--ui-text) shadow-md shadow-black/10 p-1",
    // tw-animate-css (design_system.json): scale-in for menus + reduced motion fallback
    "animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none",
  ].join(" ");

export const dropdownMenuItemClassName =
  "w-full text-left px-3 py-2 text-sm rounded-lg text-(--ui-text) hover:bg-(--ui-surface) focus:bg-(--ui-surface) outline-none";

export const dropdownMenuSeparatorClassName = "my-1 h-px bg-(--ui-border)";

