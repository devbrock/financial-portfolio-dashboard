import type * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import type { badgeStyles } from './Badge.styles';

export type BadgeVariants = VariantProps<typeof badgeStyles>;

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & BadgeVariants;
