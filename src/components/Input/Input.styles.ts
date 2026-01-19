import { cva } from 'class-variance-authority';

/**
 * Spec: `design_system.json` -> components.controls.Input.classes
 */
export const inputStyles = cva(
  [
    'w-full rounded-xl border border-(--ui-border) bg-(--ui-bg) px-3',
    'text-(--ui-text) placeholder:text-(--ui-text-subtle)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-focus)',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg)',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    'aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-200',
    'dark:aria-[invalid=true]:border-red-500/50 dark:aria-[invalid=true]:ring-red-500/20',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'h-9 text-sm',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);
