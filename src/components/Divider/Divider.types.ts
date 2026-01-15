import type * as React from "react";

export type DividerProps = Omit<React.HTMLAttributes<HTMLDivElement>, "role"> & {
  /**
   * Visual + ARIA orientation.
   */
  orientation?: "horizontal" | "vertical";
};


