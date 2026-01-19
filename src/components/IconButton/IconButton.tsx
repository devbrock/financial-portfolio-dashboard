import { cn } from '@utils/cn';
import type { IconButtonProps } from './IconButton.types';
import { iconButtonStyles } from './IconButton.styles';

/**
 * IconButton
 * Square icon action button with accessible label.
 *
 * A11y notes (spec):
 * - `aria-label` is required.
 * - Icon inside should be aria-hidden unless it conveys unique meaning.
 */
export function IconButton(props: IconButtonProps) {
  const { className, ariaLabel, icon, size, variant, ...rest } = props;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(iconButtonStyles({ size, variant }), className)}
      {...rest}
    >
      <span aria-hidden="true" className="inline-flex">
        {icon}
      </span>
    </button>
  );
}
