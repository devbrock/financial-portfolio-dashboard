import * as React from 'react';
import { cn } from '@utils/cn';
import { useSidebar } from './sidebar.context';
import type { SidebarProps, SidebarTriggerProps } from './sidebar.types';
import { ChevronLeft, ChevronRight, PanelLeft } from 'lucide-react';

/**
 * `React.CSSProperties` plus support for CSS Custom Properties (`--*`).
 *
 * React's `style` prop types are based on `csstype`, which intentionally does not
 * include arbitrary CSS variables. This adds a safe, strongly-typed index
 * signature for `--foo` style keys.
 */
interface CSSPropertiesWithVars extends React.CSSProperties {
  [key: `--${string}`]: string | number | undefined;
}

/**
 * Sidebar
 * A composable sidebar container modeled after the shadcn sidebar architecture.
 *
 * Notes:
 * - Uses semantic vars for colors/borders.
 * - Uses data attributes for stateful styling: `data-state`, `data-collapsible`.
 */
export function Sidebar(props: SidebarProps) {
  const { collapsible = 'icon', width = 280, iconWidth = 72, className, ...rest } = props;

  const { open } = useSidebar();

  // CSS variables for easy theming/override (similar to shadcn approach).
  const styleVars: CSSPropertiesWithVars = {
    '--sidebar-width': `${width}px`,
    '--sidebar-icon-width': `${iconWidth}px`,
  };

  const dataState = open ? 'open' : 'collapsed';

  return (
    <aside
      data-state={dataState}
      data-collapsible={collapsible}
      className={cn(
        'group/sidebar relative shrink-0',
        // base surface: slightly stronger separation than cards
        'border-r border-(--ui-border) bg-(--ui-inverse-bg) text-(--ui-inverse-text)',
        'h-screen',
        // width behavior
        'w-(--sidebar-width)',
        collapsible === 'icon' && 'data-[state=collapsed]:w-(--sidebar-icon-width)',
        collapsible === 'offcanvas' &&
          'data-[state=collapsed]:-ml-(--sidebar-width) data-[state=collapsed]:w-(--sidebar-width)',
        'transition-[width,margin] duration-200 motion-reduce:transition-none',
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
        'sticky top-0 z-10 border-b border-white/10 bg-(--ui-inverse-bg)',
        'px-3 py-3',
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
        'sticky bottom-0 z-10 border-t border-white/10 bg-(--ui-inverse-bg)',
        'px-3 py-3',
        className
      )}
      {...rest}
    />
  );
}

export function SidebarContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div className={cn('h-[calc(100vh-1px)] overflow-y-auto px-2 py-3', className)} {...rest} />
  );
}

/**
 * SidebarTrigger
 * A simple toggle button, typically rendered in your main layout.
 */
export function SidebarTrigger(props: SidebarTriggerProps) {
  const { className, ariaLabel = 'Toggle sidebar', ...rest } = props;
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={e => {
        rest.onClick?.(e);
        if (e.defaultPrevented) return;
        toggle();
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-xl',
        'h-11 w-11 border border-(--ui-border) bg-(--ui-bg) text-(--ui-text)',
        'hover:bg-(--ui-surface)',
        'focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg) focus-visible:outline-none',
        className
      )}
      {...rest}
    >
      <PanelLeft />
    </button>
  );
}

/**
 * SidebarRail
 * Optional narrow rail used in icon-collapsed mode for quick toggling.
 */

export function SidebarRail(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...rest } = props;
  const { open, toggle } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={e => {
        rest.onClick?.(e);
        if (e.defaultPrevented) return;
        toggle();
      }}
      className={cn(
        'absolute top-1/2 right-0 -translate-y-1/2',
        'hidden group-data-[collapsible=icon]/sidebar:block',
        'h-10 w-6 rounded-l-xl border border-white/10 bg-white/5 text-white/90',
        'hover:bg-white/10',
        'focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-inverse-bg) focus-visible:outline-none',
        className
      )}
      {...rest}
    >
      {open ? <ChevronLeft /> : <ChevronRight />}
    </button>
  );
}
