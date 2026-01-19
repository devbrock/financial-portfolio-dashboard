import { useMemo } from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { cn } from '@utils/cn';
import { ChartTooltip } from '../ChartTooltip/ChartTooltip';
import { rechartsPayloadToItems } from '../_internal/rechartsTooltip';
import { toTick, type DatumKey } from '../_internal/charts';
import type { RadarChartProps } from './RadarChart.types';

/**
 * RadarChart
 * A typed, theme-aligned radar chart (hover tooltip only).
 */
export function RadarChart<TDatum extends Record<string, unknown>>(props: RadarChartProps<TDatum>) {
  const {
    data,
    angleKey,
    series,
    height = 320,
    grid = true,
    legend = false,
    angleTickFormatter,
    radiusTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const chartData = useMemo(() => [...data], [data]);
  const angleDataKey = angleKey as DatumKey<TDatum>;

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={chartData}>
          {grid ? <PolarGrid stroke="var(--ui-border)" /> : null}

          <PolarAngleAxis
            dataKey={angleDataKey}
            tick={{ fill: 'var(--ui-text-muted)', fontSize: 12 }}
            tickFormatter={v =>
              angleTickFormatter
                ? angleTickFormatter(v as string | number)
                : toTick(v as string | number)
            }
          />

          <PolarRadiusAxis
            tick={{ fill: 'var(--ui-text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--ui-border)' }}
            tickLine={false}
            tickFormatter={v =>
              radiusTickFormatter
                ? radiusTickFormatter(v as string | number)
                : toTick(v as string | number)
            }
          />

          <Tooltip
            content={p => (
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
                color: 'var(--ui-text-muted)',
                fontSize: 12,
              }}
            />
          ) : null}

          {series.map(s => (
            <Radar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              stroke={s.color ?? 'var(--ui-primary)'}
              fill={s.color ?? 'var(--ui-primary)'}
              fillOpacity={0.12}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
