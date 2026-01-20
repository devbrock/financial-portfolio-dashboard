import { useMemo } from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@utils/cn';
import { ChartTooltip } from '../ChartTooltip/ChartTooltip';
import { rechartsPayloadToItems } from '../_internal/rechartsTooltip';
import { toTick, type DatumKey } from '../_internal/charts';
import type { BarChartProps } from './BarChart.types';

/**
 * BarChart
 * A typed, theme-aligned Recharts bar chart.
 */
export function BarChart<TDatum extends Record<string, unknown>>(props: BarChartProps<TDatum>) {
  const {
    data,
    xKey,
    series,
    height = 260,
    grid = true,
    legend = false,
    barColorKey,
    xTickFormatter,
    yTickFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
    className,
  } = props;

  const chartData = useMemo(() => [...data], [data]);
  const xDataKey = xKey as DatumKey<TDatum>;

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData}>
          {grid ? <CartesianGrid stroke="var(--ui-border)" strokeDasharray="3 3" /> : null}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: 'var(--ui-text-muted)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--ui-border)' }}
            tickFormatter={v =>
              xTickFormatter ? xTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <YAxis
            tick={{ fill: 'var(--ui-text-muted)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--ui-border)' }}
            tickFormatter={v =>
              yTickFormatter ? yTickFormatter(v as string | number) : toTick(v as string | number)
            }
          />
          <Tooltip
            cursor={{ fill: 'rgba(8,22,57,0.04)' }}
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
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color ?? 'var(--ui-primary)'}
              radius={[8, 8, 0, 0]}
            >
              {barColorKey
                ? chartData.map((datum, index) => (
                    <Cell
                      key={`cell-${s.key}-${index}`}
                      fill={(datum[barColorKey] as string) ?? s.color ?? 'var(--ui-primary)'}
                    />
                  ))
                : null}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
