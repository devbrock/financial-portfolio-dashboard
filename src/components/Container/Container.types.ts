import type * as React from 'react';

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * When true, renders the underlying element via the Slot helper,
   * allowing polymorphic composition without losing styles.
   */
  asChild?: boolean;
};
