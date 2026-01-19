import { Slot } from '@radix-ui/react-slot';
import { cn } from '@utils/cn';
import type { ButtonProps } from './Button.types';
import { buttonStyles } from './Button.styles';

function Spinner(props: { className?: string }) {
  const { className } = props;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
    />
  );
}

/**
 * Button
 * Primary action; supports variants, sizes, loading state, icons.
 *
 * A11y notes (spec):
 * - When `loading=true`: set `aria-busy=true`; consider `aria-disabled=true` and keep width stable.
 * - For icon-only usage: use `IconButton` instead.
 */
export function Button(props: ButtonProps) {
  const {
    asChild,
    className,
    size,
    variant,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...rest
  } = props;

  const Comp = asChild ? Slot : 'button';
  const isDisabled = !!disabled || loading;

  return (
    <Comp
      className={cn(buttonStyles({ size, variant }), className)}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      disabled={!asChild ? isDisabled : undefined}
      {...rest}
    >
      {/* Reserve icon space to keep width stable while loading */}
      <span className="inline-flex items-center justify-center">
        {loading ? <Spinner /> : leftIcon}
      </span>
      <span className="truncate">{children}</span>
      <span className="inline-flex items-center justify-center">{rightIcon}</span>
    </Comp>
  );
}
