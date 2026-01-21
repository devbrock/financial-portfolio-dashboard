import * as React from 'react';
import { cn } from '@/utils/cn';
import { Portal } from '../_internal/portal';
import { getFocusableElements } from '../_internal/dom';
import type { DropdownMenuContentProps } from './DropdownMenu.types';
import { dropdownMenuContentClassName } from './DropdownMenu.styles';
import { useDropdownMenuContext } from './DropdownMenuContext';

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  const { className, style, minWidth, align = 'start', sideOffset = 8, ...rest } = props;
  const ctx = useDropdownMenuContext();
  const { open, setOpen, triggerAnchorRef, contentRef } = ctx;
  const [pos, setPos] = React.useState<{
    top: number;
    left: number;
    width: number;
    side: 'top' | 'bottom';
  } | null>(null);

  React.useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const trigger = triggerAnchorRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPos({ top: rect.bottom + sideOffset, left: rect.left, width: rect.width, side: 'bottom' });
  }, [open, triggerAnchorRef]);

  React.useLayoutEffect(() => {
    if (!open || !pos) return;
    const trigger = triggerAnchorRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;
    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const padding = 8;
    const offset = sideOffset;

    const desiredLeft =
      align === 'end' ? triggerRect.right - contentRect.width : triggerRect.left;
    const nextLeft = Math.min(
      Math.max(padding, desiredLeft),
      Math.max(padding, viewportWidth - contentRect.width - padding)
    );
    if (contentRect.bottom > viewportHeight - padding) {
      const nextTop = Math.max(padding, triggerRect.top - contentRect.height - offset);
      if (nextTop !== pos.top || pos.side !== 'top' || pos.left !== nextLeft) {
        setPos(current =>
          current ? { ...current, top: nextTop, side: 'top', left: nextLeft } : current
        );
      }
      return;
    }
    if (pos.side !== 'bottom' || pos.left !== nextLeft) {
      setPos(current =>
        current
          ? { ...current, top: triggerRect.bottom + offset, side: 'bottom', left: nextLeft }
          : current
      );
    }
  }, [align, contentRef, open, pos, sideOffset, triggerAnchorRef]);

  React.useEffect(() => {
    if (!open) return;
    const onReflow = () => {
      const trigger = triggerAnchorRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPos({
        top: rect.bottom + sideOffset,
        left: rect.left,
        width: rect.width,
        side: 'bottom',
      });
    };
    window.addEventListener('scroll', onReflow, true);
    window.addEventListener('resize', onReflow);
    return () => {
      window.removeEventListener('scroll', onReflow, true);
      window.removeEventListener('resize', onReflow);
    };
  }, [open, sideOffset, triggerAnchorRef]);

  React.useEffect(() => {
    if (!open) return;
    const content = contentRef.current;
    if (!content) return;
    const focusables = getFocusableElements(content);
    focusables[0]?.focus();
  }, [contentRef, open]);

  if (!open) return null;
  if (!pos) return null;

  return (
    <Portal>
      <div
        ref={contentRef}
        role="menu"
        aria-orientation="vertical"
        data-side={pos.side}
        className={cn(
          dropdownMenuContentClassName,
          'origin-top-left data-[side=top]:origin-bottom-left',
          className
        )}
        style={{
          position: 'fixed',
          zIndex: 60,
          top: pos.top,
          left: pos.left,
          minWidth: minWidth ?? undefined,
          ...style,
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
            return;
          }
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

          e.preventDefault();
          const content = contentRef.current;
          if (!content) return;
          const focusables = getFocusableElements(content);
          const current = document.activeElement;
          const idx = focusables.findIndex(el => el === current);
          if (idx === -1) {
            focusables[0]?.focus();
            return;
          }
          const dir = e.key === 'ArrowDown' ? 1 : -1;
          const next = (idx + dir + focusables.length) % focusables.length;
          focusables[next]?.focus();
        }}
        {...rest}
      />
    </Portal>
  );
}
