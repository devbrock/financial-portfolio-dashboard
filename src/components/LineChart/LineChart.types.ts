import type * as React from "react";
import type { ChartAxisTickFormatter, ChartSeries, DatumKey } from "../_internal/charts";

export type LineChartProps<TDatum extends Record<string, unknown>> = {
  /**
   * Data array for the chart.
   */
  data: readonly TDatum[];
  /**
   * X-axis key.
   */
  xKey: DatumKey<TDatum>;
  /**
   * Series definitions (one Line per series).
   */
  series: readonly ChartSeries<TDatum>[];
  /**
   * Fixed height in pixels.
   * @defaultValue 260
   */
  height?: number;
  /**
   * Show cartesian grid.
   * @defaultValue true
   */
  grid?: boolean;
  /**
   * Show legend.
   * @defaultValue false
   */
  legend?: boolean;
  /**
   * Format ticks for x axis.
   */
  xTickFormatter?: ChartAxisTickFormatter;
  /**
   * Format ticks for y axis.
   */
  yTickFormatter?: ChartAxisTickFormatter;
  /**
   * Optional tooltip label formatter.
   */
  tooltipLabelFormatter?: (label: string | number) => React.ReactNode;
  /**
   * Optional tooltip value formatter.
   */
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  /**
   * Optional className for the wrapper.
   */
  className?: string;
};


