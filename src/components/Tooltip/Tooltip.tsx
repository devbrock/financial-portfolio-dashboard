import * as React from 'react';
import { cn } from '@utils/cn';
import { Portal } from '../_internal/portal';
import type { TooltipProps } from './Tooltip.types';
import { tooltipContentClassName } from './Tooltip.styles';

/**
 * Tooltip
 * Short supporting text on hover/focus.
 *
 * A11y notes (spec):
 * - Must appear on focus and hover.
 * - Content referenced via aria-describedby.
 * - Must not contain interactive content.
 */
export function Tooltip(props: TooltipProps) {
  const { content, children, side = 'top', delayMs = 0 } = props;
  const child = children as React.ReactElement<React.HTMLAttributes<Element>>;
  const id = React.useId();
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const timeoutRef = React.useRef<number | null>(null);

  const scheduleOpen = (anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect();
    const top = side === 'top' ? rect.top - 10 : rect.bottom + 10;
    const left = rect.left + rect.width / 2;

    const openNow = () => {
      setPos({ top, left });
      setOpen(true);
    };

    if (delayMs <= 0) {
      openNow();
      return;
    }

    timeoutRef.current = window.setTimeout(openNow, delayMs);
  };

  const close = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setOpen(false);
  };

  const childProps = {
    'aria-describedby': open ? id : undefined,
    onMouseEnter: (e: React.MouseEvent<Element>) => {
      child.props.onMouseEnter?.(e);
      if (e.defaultPrevented) return;
      scheduleOpen(e.currentTarget as HTMLElement);
    },
    onMouseLeave: (e: React.MouseEvent<Element>) => {
      child.props.onMouseLeave?.(e);
      close();
    },
    onFocus: (e: React.FocusEvent<Element>) => {
      child.props.onFocus?.(e);
      if (e.defaultPrevented) return;
      scheduleOpen(e.currentTarget as HTMLElement);
    },
    onBlur: (e: React.FocusEvent<Element>) => {
      child.props.onBlur?.(e);
      close();
    },
  } satisfies Partial<React.ComponentProps<'span'>>;

  return (
    <>
      {/* eslint-disable-next-line react-hooks/refs */}
      {React.cloneElement(child, childProps)}
      {open ? (
        <Portal>
          <div
            id={id}
            role="tooltip"
            className={cn(tooltipContentClassName)}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              transform: side === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          >
            {content}
          </div>
        </Portal>
      ) : null}
    </>
  );
}
