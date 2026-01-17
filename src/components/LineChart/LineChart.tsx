import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@utils/cn";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import { rechartsPayloadToItems } from "../_internal/rechartsTooltip";
import { toTick, type DatumKey } from "../_internal/charts";
import type { LineChartProps } from "./LineChart.types";

/**
 * LineChart
 * A typed, theme-aligned Recharts line chart.
 */
export function LineChart<TDatum extends Record<string, unknown>>(
  props: LineChartProps<TDatum>
) {
  const {
    data,
    xKey,
    series,
    height = 260,
    grid = true,
    legend = false,
    xTickFormatter,
    yTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const chartData = useMemo(() => [...data], [data]);
  const xDataKey = xKey as DatumKey<TDatum>;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={chartData}>
          {grid ? (
            <CartesianGrid stroke="var(--ui-border)" strokeDasharray="3 3" />
          ) : null}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              xTickFormatter
                ? xTickFormatter(v as string | number)
                : toTick(v as string | number)
            }
          />
          <YAxis
            tick={{ fill: "var(--ui-text-muted)", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "var(--ui-border)" }}
            tickFormatter={(v) =>
              yTickFormatter
                ? yTickFormatter(v as string | number)
                : toTick(v as string | number)
            }
          />
          <Tooltip
            cursor={{ stroke: "var(--ui-border-strong)" }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={rechartsPayloadToItems(p.payload as readonly unknown[])}
                labelFormatter={tooltipLabelFormatter}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
          {legend ? (
            <Legend
              wrapperStyle={{
                color: "var(--ui-text-muted)",
                fontSize: 12,
              }}
            />
          ) : null}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? "var(--ui-primary)"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
