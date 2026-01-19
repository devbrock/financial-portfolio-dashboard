import { cn } from '@utils/cn';
import type { ChipProps } from './Chip.types';
import { chipFocusStyles, chipStyles } from './Chip.styles';

/**
 * Chip
 * Selectable pill for toggles (e.g., time ranges).
 *
 * A11y notes (spec):
 * - Render as `<button type="button">` by default.
 * - Expose pressed state via `aria-pressed` when used as toggle.
 */
export function Chip(props: ChipProps) {
  const { className, selected = false, disabled = false, ...rest } = props;

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(chipStyles({ selected, disabled }), chipFocusStyles, className)}
      {...rest}
    />
  );
}
