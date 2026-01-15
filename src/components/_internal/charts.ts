/**
 * Shared helpers/types for our Recharts components.
 */

export type DatumKey<T> = Extract<keyof T, string>;

export type ChartSeries<T> = {
  /**
   * Property name on each datum to read values from.
   */
  key: DatumKey<T>;
  /**
   * Display name for legends/tooltips.
   */
  name: string;
  /**
   * CSS color for the series (supports `var(--...)`).
   */
  color?: string;
};

export type ChartAxisTickFormatter = (value: string | number) => string;

/**
 * Converts a value to a label-friendly string.
 */
export function toTick(value: string | number): string {
  return typeof value === "number" ? String(value) : value;
}


