/**
 * Spec: `design_system.json` -> components.dataDisplay.DeltaPill.classes
 */
export const deltaPillBaseClassName =
  'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold border';

export const deltaPillToneClassName = {
  success:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/25',
  danger:
    'bg-red-50 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/25',
  neutral: 'bg-(--ui-surface) text-(--ui-text) border-(--ui-border)',
} as const;
