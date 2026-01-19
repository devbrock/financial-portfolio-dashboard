import { cva } from 'class-variance-authority';

/**
 * Spec: `design_system.json` -> components.controls.IconButton.classes
 */
export const iconButtonStyles = cva(
  [
    'inline-flex items-center justify-center rounded-xl',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-focus)',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg)',
    'disabled:opacity-50 disabled:pointer-events-none',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-9 w-9',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
      variant: {
        ghost: 'hover:bg-(--ui-surface) text-(--ui-text)',
        secondary: 'bg-(--ui-surface-2) border border-(--ui-border) hover:bg-(--ui-surface)',
        inverse: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'ghost',
    },
  }
);
