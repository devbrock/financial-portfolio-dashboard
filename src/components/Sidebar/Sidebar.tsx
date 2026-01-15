import * as React from "react";
import { cn } from "@utils/cn";
import { useSidebar } from "./sidebar.context";
import type { SidebarProps, SidebarTriggerProps } from "./sidebar.types";

/**
 * Sidebar
 * A composable sidebar container modeled after the shadcn sidebar architecture.
 *
 * Notes:
 * - Uses semantic vars for colors/borders.
 * - Uses data attributes for stateful styling: `data-state`, `data-collapsible`.
 */
export function Sidebar(props: SidebarProps) {
  const {
    collapsible = "icon",
    width = 280,
    iconWidth = 72,
    className,
    ...rest
  } = props;

  const { open } = useSidebar();

  // CSS variables for easy theming/override (similar to shadcn approach).
  const styleVars = {
    ["--sidebar-width" as const]: `${width}px`,
    ["--sidebar-icon-width" as const]: `${iconWidth}px`,
  };

  const dataState = open ? "open" : "collapsed";

  return (
    <aside
      data-state={dataState}
      data-collapsible={collapsible}
      className={cn(
        "group/sidebar relative shrink-0",
        // base surface: slightly stronger separation than cards
        "border-r border-(--ui-border) bg-(--ui-inverse-bg) text-(--ui-inverse-text)",
        "h-screen",
        // width behavior
        "w-(--sidebar-width)",
        collapsible === "icon" &&
          "data-[state=collapsed]:w-(--sidebar-icon-width)",
        collapsible === "offcanvas" &&
          "data-[state=collapsed]:-ml-(--sidebar-width) data-[state=collapsed]:w-(--sidebar-width)",
        "transition-[width,margin] duration-200 motion-reduce:transition-none",
        className
      )}
      style={styleVars}
      {...rest}
    />
  );
}

export function SidebarHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "sticky top-0 z-10 border-b border-white/10 bg-(--ui-inverse-bg)",
        "px-3 py-3",
        className
      )}
      {...rest}
    />
  );
}

export function SidebarFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 border-t border-white/10 bg-(--ui-inverse-bg)",
        "px-3 py-3",
        className
      )}
      {...rest}
    />
  );
}

export function SidebarContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn("h-[calc(100vh-1px)] overflow-y-auto px-2 py-3", className)}
      {...rest}
    />
  );
}

/**
 * SidebarTrigger
 * A simple toggle button, typically rendered in your main layout.
 */
export function SidebarTrigger(props: SidebarTriggerProps) {
  const { className, ariaLabel = "Toggle sidebar", ...rest } = props;
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={(e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented) return;
        toggle();
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-xl",
        "h-10 w-10 border border-(--ui-border) bg-(--ui-bg) text-(--ui-text)",
        "hover:bg-(--ui-surface)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg)",
        className
      )}
      {...rest}
    >
      {/* Hamburger icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="lucide lucide-panel-left-icon lucide-panel-left"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
    </button>
  );
}

/**
 * SidebarRail
 * Optional narrow rail used in icon-collapsed mode for quick toggling.
 */
export function SidebarRail(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { className, ...rest } = props;
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={(e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented) return;
        toggle();
      }}
      className={cn(
        "absolute right-0 top-1/2 -translate-y-1/2",
        "hidden group-data-[collapsible=icon]/sidebar:block",
        "h-10 w-6 rounded-l-xl border border-white/10 bg-white/5 text-white/90",
        "hover:bg-white/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-inverse-bg)",
        className
      )}
      {...rest}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="mx-auto h-4 w-4"
        fill="none"
      >
        <path
          d="M14 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
