import type * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { stackStyles } from './Stack.styles';

export type StackVariants = VariantProps<typeof stackStyles>;

export type StackProps = React.HTMLAttributes<HTMLDivElement> &
  StackVariants & {
    /**
     * When true, renders the underlying element via Radix `Slot`,
     * allowing polymorphic composition without losing styles.
     */
    asChild?: boolean;
  };
