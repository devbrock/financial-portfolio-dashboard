import type * as React from "react";

export type TreemapNode = {
  name: string;
  value: number;
  /**
   * Optional nested children.
   */
  children?: readonly TreemapNode[];
};

export type TreemapProps = {
  /**
   * Root-level nodes (can be hierarchical via children).
   */
  data: readonly TreemapNode[];
  /**
   * Fixed height in pixels.
   * @defaultValue 320
   */
  height?: number;
  /**
   * Colors used for leaf nodes (cycled).
   */
  colors?: readonly string[];
  /**
   * Tooltip value formatter.
   */
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  className?: string;
};


