import * as React from "react";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@utils/cn";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import { rechartsPayloadToItems } from "../_internal/rechartsTooltip";
import type { DatumKey } from "../_internal/charts";
import type { PieDonutChartProps } from "./PieDonutChart.types";

const DEFAULT_COLORS = [
  "var(--ui-primary)",
  "var(--ui-accent)",
  "color-mix(in oklab, var(--ui-primary) 60%, white 40%)",
  "color-mix(in oklab, var(--ui-accent) 60%, white 40%)",
] as const;

/**
 * PieDonutChart
 * A typed, theme-aligned Pie/Donut chart (hover tooltip only).
 */
export function PieDonutChart<TDatum extends Record<string, unknown>>(
  props: PieDonutChartProps<TDatum>
) {
  const {
    data,
    nameKey,
    valueKey,
    height = 260,
    variant = "donut",
    innerRadius,
    outerRadius,
    colors = DEFAULT_COLORS,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const nameDataKey = nameKey as DatumKey<TDatum>;
  const valueDataKey = valueKey as DatumKey<TDatum>;

  const derivedOuter = outerRadius ?? 90;
  const derivedInner =
    variant === "donut" ? innerRadius ?? Math.round(derivedOuter * 0.62) : 0;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Tooltip
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
          <Pie
            data={data}
            dataKey={valueDataKey}
            nameKey={nameDataKey}
            innerRadius={derivedInner}
            outerRadius={derivedOuter}
            stroke="var(--ui-bg)"
            strokeWidth={2}
          >
            {data.map((_, idx) => (
              <Cell
                key={idx}
                fill={colors[idx % colors.length] ?? "var(--ui-primary)"}
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
