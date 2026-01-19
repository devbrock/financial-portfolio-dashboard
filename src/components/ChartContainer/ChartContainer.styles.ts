import { cva } from 'class-variance-authority';

/**
 * ChartContainer
 * Executive-friendly chart surface: soft border, subtle background, predictable padding.
 */
export const chartContainerStyles = cva('rounded-2xl border border-(--ui-border) bg-(--ui-bg) p-6');

export const chartHeaderStyles = cva('mb-4 flex items-start justify-between gap-4');
export const chartTitleStyles = cva('font-(--font-brand) text-base font-semibold text-(--ui-text)');
export const chartSubtitleStyles = cva('text-sm text-(--ui-text-muted)');
