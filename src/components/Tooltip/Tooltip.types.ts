import type * as React from 'react';

export type TooltipProps = {
  /**
   * Tooltip content. Keep it short and non-interactive (spec).
   */
  content: React.ReactNode;
  /**
   * Child element that receives aria-describedby + hover/focus handlers.
   */
  children: React.ReactElement;
  /**
   * Preferred side for placement.
   */
  side?: 'top' | 'bottom';
  /**
   * Optional delay before showing (ms).
   */
  delayMs?: number;
};
