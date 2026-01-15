import type { ChartTooltipItem } from "../ChartTooltip/ChartTooltip.types";

type RechartsPayloadEntry = {
  name?: unknown;
  value?: unknown;
  color?: unknown;
  dataKey?: unknown;
};

/**
 * Safely converts Recharts tooltip payload to our internal tooltip item format.
 * Recharts' types intentionally use `any` for payload, so we treat it as `unknown`.
 */
export function rechartsPayloadToItems(
  payload: readonly unknown[],
  fallbackSeriesName = "Series"
): ChartTooltipItem[] {
  const items: ChartTooltipItem[] = [];

  for (const entry of payload) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as RechartsPayloadEntry;

    const name =
      typeof e.name === "string"
        ? e.name
        : typeof e.dataKey === "string"
          ? e.dataKey
          : fallbackSeriesName;

    const value = e.value;
    if (typeof value !== "number" && typeof value !== "string") continue;

    items.push({
      name,
      value,
      color: typeof e.color === "string" ? e.color : undefined,
    });
  }

  return items;
}


