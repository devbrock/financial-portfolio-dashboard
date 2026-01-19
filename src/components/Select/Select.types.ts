import type * as React from 'react';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  /**
   * Optional test id.
   */
  'data-testid'?: string;
};
