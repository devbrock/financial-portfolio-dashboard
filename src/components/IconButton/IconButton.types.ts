import type * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { iconButtonStyles } from './IconButton.styles';

export type IconButtonVariants = VariantProps<typeof iconButtonStyles>;

export type IconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  IconButtonVariants & {
    /**
     * Accessible name for icon-only buttons (required).
     */
    ariaLabel: string;
    /**
     * Icon content (required).
     */
    icon: React.ReactNode;
  };
