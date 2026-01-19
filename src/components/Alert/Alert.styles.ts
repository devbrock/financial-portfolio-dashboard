import { cva } from 'class-variance-authority';

/**
 * Spec: `design_system.json` -> components.dataDisplay.Alert.classes
 */
export const alertStyles = cva('rounded-2xl border p-4 flex gap-3', {
  variants: {
    tone: {
      info: 'bg-(--ui-surface) border-(--ui-border) text-(--ui-text)',
      success:
        'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-100',
      warning:
        'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/25 dark:text-amber-100',
      danger:
        'bg-red-50 border-red-200 text-red-900 dark:bg-red-500/10 dark:border-red-500/25 dark:text-red-100',
    },
  },
  defaultVariants: {
    tone: 'info',
  },
});
