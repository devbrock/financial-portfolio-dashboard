import { cva } from 'class-variance-authority';

/**
 * Spec: `design_system.json` -> components.primitives.Heading.classes
 */
export const headingStyles = cva('font-(--font-brand) tracking-tight', {
  variants: {
    as: {
      h1: 'text-4xl md:text-5xl font-semibold',
      h2: 'text-3xl md:text-4xl font-semibold',
      h3: 'text-2xl md:text-3xl font-semibold',
      h4: 'text-xl md:text-2xl font-semibold',
      h5: 'text-lg font-semibold',
      h6: 'text-base font-semibold',
    },
    tone: {
      default: 'text-(--ui-text)',
      muted: 'text-(--ui-text-muted)',
      inverse: 'text-(--ui-inverse-text)',
    },
  },
  defaultVariants: {
    as: 'h2',
    tone: 'default',
  },
});
