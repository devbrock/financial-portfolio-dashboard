import { cn } from '@utils/cn';
import type { ChartTooltipProps } from './ChartTooltip.types';

/**
 * ChartTooltip
 * A small, executive-friendly tooltip surface that matches our semantic color system.
 */
export function ChartTooltip(props: ChartTooltipProps) {
  const { active, label, items, labelFormatter, valueFormatter, className } = props;

  if (!active || !items || items.length === 0) return null;

  const formatValue = (value: string | number) =>
    typeof value === 'number' ? value.toFixed(2) : value;

  return (
    <div
      className={cn(
        'rounded-xl border border-(--ui-border) bg-(--ui-bg) shadow-md shadow-black/10',
        'px-3 py-2 text-sm text-(--ui-text)',
        className
      )}
    >
      {label !== undefined ? (
        <div className="mb-2 text-xs font-semibold text-(--ui-text-muted)">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      ) : null}

      <div className="space-y-1">
        {items.map(it => (
          <div key={it.name} className="flex items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: it.color ?? 'var(--ui-primary)' }}
              />
              <span className="truncate">{it.name}</span>
            </div>
            <span className="font-semibold">
              {valueFormatter
                ? (() => {
                    const formatted = valueFormatter(it.value);
                    return typeof formatted === 'number' ? formatted.toFixed(2) : formatted;
                  })()
                : formatValue(it.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
