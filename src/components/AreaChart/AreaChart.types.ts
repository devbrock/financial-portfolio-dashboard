import type * as React from "react";
import type { ChartAxisTickFormatter, ChartSeries, DatumKey } from "../_internal/charts";

export type AreaChartProps<TDatum extends Record<string, unknown>> = {
  data: readonly TDatum[];
  xKey: DatumKey<TDatum>;
  series: readonly ChartSeries<TDatum>[];
  height?: number;
  grid?: boolean;
  legend?: boolean;
  xTickFormatter?: ChartAxisTickFormatter;
  yTickFormatter?: ChartAxisTickFormatter;
  tooltipLabelFormatter?: (label: string | number) => React.ReactNode;
  tooltipValueFormatter?: (value: string | number) => React.ReactNode;
  className?: string;
};


