import { cva } from 'class-variance-authority';

/**
 * Spec: `design_system.json` -> components.controls.Badge.classes
 */
export const badgeStyles = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border',
  {
    variants: {
      tone: {
        neutral: 'bg-(--ui-surface) text-(--ui-text) border-(--ui-border)',
        info: 'bg-[color:var(--color-brand-light-blue)] text-(--ui-text) border-(--ui-border) dark:bg-white/10 dark:text-(--ui-text)',
        success:
          'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/25',
        warning:
          'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/25',
        danger:
          'bg-red-50 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/25',
        accent:
          'bg-[color:var(--color-brand-lavendar)]/25 text-(--ui-text) border-(--ui-border) dark:bg-[color:var(--color-brand-lavendar)]/20',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  }
);
