import type * as React from 'react';

export type DeltaPillProps = React.HTMLAttributes<HTMLSpanElement> & {
  /**
   * Required: direction of the change.
   */
  direction: 'up' | 'down' | 'flat';
  /**
   * Required: tone for styling.
   */
  tone: 'success' | 'danger' | 'neutral';
  /**
   * Text like "+2.4%" or "-1.1%".
   * Spec requirement: do not convey meaning via arrow/color only.
   */
  children: React.ReactNode;
};
