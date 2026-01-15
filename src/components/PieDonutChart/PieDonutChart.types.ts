import type * as React from "react";
import type { DatumKey } from "../_internal/charts";

export type PieDonutChartProps<TDatum extends Record<string, unknown>> = {
  /**
   * Data array for the chart.
   */
  data: readonly TDatum[];
  /**
   * Key for slice labels.
   */
  nameKey: DatumKey<TDatum>;
  /**
   * Key for slice values.
   */
  valueKey: DatumKey<TDatum>;
  /**
   * Fixed height in pixels.
   * @defaultValue 260
   */
  height?: number;
  /**
   * Chart variant.
   * @defaultValue "donut"
   */
  variant?: "pie" | "donut";
  /**
   * Inner radius (overrides default donut radius when variant="donut").
   */
  innerRadius?: number;
  /**
   * Outer radius.
   */
  outerRadius?: number;
  /**
   * Colors used for slices (cycled).
   */
  colors?: readonly string[];
  /**
   * Tooltip label/value formatters.
   */
  tooltipLabelFormatter?: (label: string | number) => React.ReactNode;
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  className?: string;
};


