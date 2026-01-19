import { cn } from '@utils/cn';
import type { BadgeProps } from './Badge.types';
import { badgeStyles } from './Badge.styles';

/**
 * Badge
 * Small status/type label pill (non-interactive).
 */
export function Badge(props: BadgeProps) {
  const { className, tone, ...rest } = props;
  return <span className={cn(badgeStyles({ tone }), className)} {...rest} />;
}
