import { cva } from 'class-variance-authority';

/**
 * Spec: `design_system.json` -> components.controls.Chip.classes
 */
export const chipStyles = cva(
  'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold border',
  {
    variants: {
      selected: {
        true: 'bg-(--ui-primary) text-(--ui-primary-ink) border-transparent',
        false: 'bg-(--ui-bg) text-(--ui-text) border-(--ui-border) hover:bg-(--ui-surface)',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      selected: false,
      disabled: false,
    },
  }
);

export const chipFocusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg)';
