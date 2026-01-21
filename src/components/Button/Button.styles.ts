import { cva } from 'class-variance-authority';

/**
 * Spec: `design_system.json` -> components.controls.Button.classes
 */
export const buttonStyles = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-xl min-h-11',
    'font-(--font-brand-secondary) font-semibold select-none',
    'disabled:opacity-50 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-focus)',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg)',
    'transition-colors duration-200',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-11 px-3 text-sm',
        md: 'h-12 px-4 text-sm',
        lg: 'h-14 px-5 text-base',
      },
      variant: {
        primary: 'bg-(--ui-primary) text-(--ui-primary-ink) hover:brightness-95',
        secondary:
          'bg-(--ui-surface-2) text-(--ui-text) border border-(--ui-border) hover:bg-(--ui-surface)',
        ghost: 'bg-transparent text-(--ui-text) hover:bg-(--ui-surface)',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        inverse:
          'bg-(--ui-inverse-bg) text-(--ui-inverse-text) hover:brightness-110 border border-white/10',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'primary',
    },
  }
);
