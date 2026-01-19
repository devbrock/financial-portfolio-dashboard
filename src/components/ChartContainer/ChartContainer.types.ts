import type * as React from 'react';

export type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * Optional title displayed above the chart.
   */
  title?: React.ReactNode;
  /**
   * Optional supporting text displayed below the title.
   */
  subtitle?: React.ReactNode;
  /**
   * Optional right-side header actions (buttons, select, etc.).
   */
  actions?: React.ReactNode;
};
