import { forwardRef } from 'react';
import { cn } from '@utils/cn';
import type { SelectProps } from './Select.types';
import { selectStyles } from './Select.styles';

/**
 * Select
 * Native select styled to match inputs (accessible and simple).
 *
 * A11y notes (spec):
 * - Prefer native `<select>` unless requirements demand searchable combobox.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(props, ref) {
  const { className, children, ...rest } = props;

  return (
    <div className="relative">
      <select ref={ref} className={cn(selectStyles(), className)} {...rest}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-(--ui-text-muted)"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});
