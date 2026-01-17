import { useMemo } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  Treemap as RechartsTreemap,
} from "recharts";
import { cn } from "@utils/cn";
import { ChartTooltip } from "../ChartTooltip/ChartTooltip";
import type { ChartTooltipItem } from "../ChartTooltip/ChartTooltip.types";
import type { TreemapProps } from "./Treemap.types";

const DEFAULT_COLORS = [
  "var(--ui-primary)",
  "var(--ui-accent)",
  "color-mix(in oklab, var(--ui-primary) 65%, white 35%)",
  "color-mix(in oklab, var(--ui-accent) 65%, white 35%)",
] as const;

type ContentProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: unknown;
  value?: unknown;
  depth?: number;
};

function TreemapCell(props: ContentProps & { colors: readonly string[] }) {
  const { x, y, width, height, index, name, value, depth, colors } = props;
  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined
  )
    return null;

  // Only style leaf nodes; parent groups are handled by Recharts layout.
  const isLeaf = (depth ?? 0) >= 1;
  const fill = colors[(index ?? 0) % colors.length] ?? "var(--ui-primary)";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={isLeaf ? 0.18 : 0.06}
        stroke="var(--ui-border)"
        strokeWidth={1}
        rx={10}
        ry={10}
      />
      {isLeaf && width > 60 && height > 28 ? (
        <text
          x={x + 10}
          y={y + 18}
          fill="var(--ui-text)"
          fontSize={12}
          fontWeight={600}
        >
          {typeof name === "string" ? name : ""}
        </text>
      ) : null}
      {isLeaf && width > 60 && height > 44 ? (
        <text x={x + 10} y={y + 36} fill="var(--ui-text-muted)" fontSize={11}>
          {typeof value === "number" ? value : ""}
        </text>
      ) : null}
    </g>
  );
}

type TooltipPayloadEntry = {
  name?: unknown;
  value?: unknown;
};

function toTreemapTooltipItems(
  payload: readonly unknown[]
): ChartTooltipItem[] {
  const items: ChartTooltipItem[] = [];
  for (const entry of payload) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as TooltipPayloadEntry;
    if (typeof e.value !== "number" && typeof e.value !== "string") continue;
    items.push({
      name: typeof e.name === "string" ? e.name : "Value",
      value: e.value,
    });
  }
  return items;
}

/**
 * Treemap
 * A theme-aligned treemap. Best for composition breakdowns (sectors, allocations, etc.).
 */
export function Treemap(props: TreemapProps) {
  const {
    data,
    height = 320,
    colors = DEFAULT_COLORS,
    tooltipValueFormatter,
    className,
  } = props;

  const chartData = useMemo(() => [...data], [data]);

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsTreemap
          data={chartData}
          dataKey="value"
          nameKey="name"
          stroke="var(--ui-border)"
          content={<TreemapCell colors={colors} />}
        >
          <Tooltip
            content={(p) => (
              <ChartTooltip
                active={p.active}
                label={p.label}
                items={toTreemapTooltipItems(p.payload as readonly unknown[])}
                valueFormatter={tooltipValueFormatter}
              />
            )}
          />
        </RechartsTreemap>
      </ResponsiveContainer>
    </div>
  );
}
