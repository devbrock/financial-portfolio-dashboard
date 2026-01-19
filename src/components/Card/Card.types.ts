import type * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { cardStyles } from './Card.styles';

export type CardVariants = VariantProps<typeof cardStyles>;

export type CardProps = React.HTMLAttributes<HTMLDivElement> &
  CardVariants & {
    /**
     * When true, renders the underlying element via Radix `Slot`,
     * allowing polymorphic composition without losing styles.
     */
    asChild?: boolean;
  };

export type CardSectionProps = React.HTMLAttributes<HTMLDivElement>;
