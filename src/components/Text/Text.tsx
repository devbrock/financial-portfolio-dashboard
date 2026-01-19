import * as React from 'react';
import { cn } from '@utils/cn';
import type { TextProps } from './Text.types';
import { textStyles } from './Text.styles';

/**
 * Text
 * Typography primitive for paragraphs/labels/muted text variants.
 */
export function Text<TAs extends React.ElementType = 'p'>(props: TextProps<TAs>) {
  const { as = 'p', size, tone, className, ...rest } = props;
  const Comp = as;

  return <Comp className={cn(textStyles({ size, tone }), className)} {...rest} />;
}
