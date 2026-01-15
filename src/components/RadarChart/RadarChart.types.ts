import type * as React from "react";
import type { ChartAxisTickFormatter, ChartSeries, DatumKey } from "../_internal/charts";

export type RadarChartProps<TDatum extends Record<string, unknown>> = {
  data: readonly TDatum[];
  /**
   * Key for the angle axis (category name).
   */
  angleKey: DatumKey<TDatum>;
  /**
   * Series definitions (one Radar per series).
   */
  series: readonly ChartSeries<TDatum>[];
  height?: number;
  grid?: boolean;
  legend?: boolean;
  angleTickFormatter?: ChartAxisTickFormatter;
  radiusTickFormatter?: ChartAxisTickFormatter;
  tooltipLabelFormatter?: (label: string | number) => React.ReactNode;
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  className?: string;
};


