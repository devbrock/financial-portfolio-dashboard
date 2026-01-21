import * as React from 'react';
import { cn } from '@/utils/cn';

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

/**
 * Slot
 * Minimal as-child helper to merge props into a single child element.
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(function Slot(props, ref) {
  const { children, className, ...rest } = props;

  if (!React.isValidElement(children)) {
    return null;
  }

  const childProps = children.props as { className?: string };
  const mergedClassName = cn(childProps.className, className);

  return React.cloneElement(children, {
    ...(rest as React.HTMLAttributes<HTMLElement>),
    ref,
    className: mergedClassName || undefined,
  } as React.Attributes & React.HTMLAttributes<HTMLElement>);
});
