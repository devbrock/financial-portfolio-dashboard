import * as React from 'react';
import { Slot } from '@/components/_internal/Slot';
import { cn } from '@utils/cn';

export function SidebarGroup(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn('px-1 py-2', className)} {...rest} />;
}

export function SidebarGroupLabel(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn(
        'px-2 pb-2 text-xs font-semibold tracking-wide text-white/70 uppercase',
        // Hide label in icon-collapsed mode
        'group-data-[state=collapsed]/sidebar:hidden',
        className
      )}
      {...rest}
    />
  );
}

export function SidebarGroupContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn('space-y-1', className)} {...rest} />;
}

export function SidebarSeparator(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div role="separator" className={cn('my-2 h-px bg-white/10', className)} {...rest} />;
}

export function SidebarMenu(props: React.HTMLAttributes<HTMLUListElement>) {
  const { className, ...rest } = props;
  return <ul className={cn('space-y-1', className)} {...rest} />;
}

export function SidebarMenuItem(props: React.HTMLAttributes<HTMLLIElement>) {
  const { className, ...rest } = props;
  return <li className={cn(className)} {...rest} />;
}

export type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  /**
   * Marks the button as active.
   */
  isActive?: boolean;
};

/**
 * SidebarMenuButton
 * The primary navigation button. In icon-collapsed mode, only the icon remains visible.
 *
 * Usage convention:
 * - Put the icon as the first child.
 * - Wrap the label text in `<span data-slot="label">…</span>` so it can be hidden in icon mode.
 */
export function SidebarMenuButton(props: SidebarMenuButtonProps) {
  const { asChild, className, children, isActive, ...rest } = props;
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-active={isActive ? 'true' : 'false'}
      className={cn(
        'group/menu-button relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold',
        'text-white/90 hover:bg-white/10',
        'focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-inverse-bg) focus-visible:outline-none',
        'data-[active=true]:bg-white/12 data-[active=true]:text-white',
        // Collapse-to-icons behavior (shadcn-inspired)
        'group-data-[state=collapsed]/sidebar:justify-center',
        'group-data-[state=collapsed]/sidebar:px-2',
        'group-data-[state=collapsed]/sidebar:[&_[data-slot=label]]:hidden',
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export type SidebarMenuActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * SidebarMenuAction
 * Secondary action on the right of a menu item (e.g., settings, more menu).
 * Visible on hover or when the menu button is active.
 */
export function SidebarMenuAction(props: SidebarMenuActionProps) {
  const { className, ...rest } = props;
  return (
    <button
      type="button"
      className={cn(
        'ml-auto inline-flex h-8 w-8 items-center justify-center rounded-xl',
        'text-white/70 hover:bg-white/10 hover:text-white',
        'opacity-0 group-hover/menu-button:opacity-100',
        'group-data-[active=true]/menu-button:opacity-100',
        'focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-inverse-bg) focus-visible:outline-none',
        className
      )}
      {...rest}
    />
  );
}
