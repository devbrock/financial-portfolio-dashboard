import { cva } from 'class-variance-authority';

/**
 * Spec: `design_system.json` -> components.primitives.Card.classes
 */
export const cardStyles = cva(
  'rounded-2xl border border-(--ui-border) p-6 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none',
  {
    variants: {
      tone: {
        default: 'bg-(--ui-bg) text-(--ui-text)',
        soft: 'bg-(--ui-surface) text-(--ui-text)',
        inverse: 'bg-(--ui-inverse-bg) text-(--ui-inverse-text) border-white/10',
      },
      elevation: {
        none: 'shadow-none',
        sm: 'shadow-sm shadow-black/5',
        md: 'shadow-md shadow-black/10',
      },
    },
    defaultVariants: {
      tone: 'default',
      elevation: 'sm',
    },
  }
);

export const cardHeaderStyles = cva('flex items-start justify-between gap-4 pb-4');
export const cardBodyStyles = cva('space-y-4');
export const cardFooterStyles = cva('pt-4 flex items-center justify-end gap-3');
