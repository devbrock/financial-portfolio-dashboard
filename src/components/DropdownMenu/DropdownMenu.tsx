import * as React from 'react';
import { useControllableState } from '../_internal/useControllableState';
import type { DropdownMenuProps } from './DropdownMenu.types';
import { DropdownMenuProvider, type DropdownMenuContextValue } from './DropdownMenuContext';
import { isEventInside } from '../_internal/dom';

/**
 * DropdownMenu
 * Action menu (sort presets, row actions).
 *
 * A11y notes (spec):
 * - Opens on Enter/Space/ArrowDown from trigger.
 * - Arrow keys navigate items; Esc closes; focus returns to trigger.
 */
export function DropdownMenu(props: DropdownMenuProps) {
  const { open, defaultOpen = false, onOpenChange, children } = props;
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const triggerAnchorRef = React.useRef<HTMLSpanElement | null>(null);
  const triggerElRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target;
      const trigger = triggerAnchorRef.current;
      const content = contentRef.current;
      if (!trigger || !content) return;
      if (isEventInside(content, target) || isEventInside(trigger, target)) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isOpen, setIsOpen]);

  React.useEffect(() => {
    if (isOpen) return;
    triggerElRef.current?.focus();
  }, [isOpen]);

  const ctx: DropdownMenuContextValue = React.useMemo(
    () => ({
      open: isOpen,
      setOpen: setIsOpen,
      triggerAnchorRef,
      triggerElRef,
      contentRef,
    }),
    [isOpen, setIsOpen]
  );

  return <DropdownMenuProvider value={ctx}>{children}</DropdownMenuProvider>;
}

export { DropdownMenuContent } from './DropdownMenuContent';
export { DropdownMenuItem } from './DropdownMenuItem';
export { DropdownMenuSeparator } from './DropdownMenuSeparator';
export { DropdownMenuTrigger } from './DropdownMenuTrigger';
