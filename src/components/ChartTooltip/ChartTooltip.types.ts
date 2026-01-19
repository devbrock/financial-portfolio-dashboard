import type * as React from 'react';

export type ChartTooltipItem = {
  name: string;
  value: string | number;
  color?: string;
};

export type ChartTooltipProps = {
  /**
   * Whether the tooltip is currently active (provided by Recharts).
   */
  active?: boolean;
  /**
   * Tooltip label (typically the x-axis value).
   */
  label?: string | number;
  /**
   * Tooltip payload items (derived from Recharts payload).
   */
  items?: readonly ChartTooltipItem[];
  /**
   * Optional label formatter.
   */
  labelFormatter?: (label: string | number) => React.ReactNode;
  /**
   * Optional value formatter.
   */
  valueFormatter?: (value: string | number) => React.ReactNode;
  /**
   * Optional className override.
   */
  className?: string;
};
