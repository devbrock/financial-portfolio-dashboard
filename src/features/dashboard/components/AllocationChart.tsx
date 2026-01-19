import { useMemo } from 'react';
import { ChartContainer, Inline, PieDonutChart, Skeleton, Text } from '@components';
import { cn } from '@/utils/cn';
import type { AllocationSlice } from '@/types/dashboard';
import { formatMoneyUsd } from '@utils/formatMoneyUsd';

type AllocationChartProps = {
  data: readonly AllocationSlice[];
  totalInvested: number;
  loading?: boolean;
  flash?: boolean;
};

export function AllocationChart(props: AllocationChartProps) {
  const { data, totalInvested, loading = false, flash = false } = props;
  const chartColors = useMemo(() => data.map(slice => slice.color), [data]);
  const legendItems = useMemo(
    () => data.map(slice => ({ name: slice.name, color: slice.color })),
    [data]
  );

  return (
    <ChartContainer
      title="Diversification"
      subtitle="Current allocation"
      className={cn(
        flash && 'animate-pulse shadow-[0_0_0_2px_rgba(16,185,129,0.2)] ring-2 ring-emerald-200/80'
      )}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mx-auto h-[260px] w-full" />
        </div>
      ) : (
        <div className="relative">
          <PieDonutChart<AllocationSlice>
            data={data}
            nameKey="name"
            valueKey="value"
            variant="donut"
            colors={chartColors}
            tooltipLabelFormatter={l => <span>{String(l)}</span>}
            tooltipValueFormatter={v => <span>{String(v)}%</span>}
          />

          {/* Center label */}
          <div
            className={cn(
              'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'text-center'
            )}
          >
            <Text as="div" className="text-lg font-semibold">
              {formatMoneyUsd(totalInvested)}
            </Text>
            <Text as="div" size="sm" tone="muted">
              Total invested
            </Text>
          </div>
        </div>
      )}

      {/* Legend */}
      {!loading ? (
        <Inline wrap gap="sm" className="mt-3">
          {legendItems.map(item => (
            <Inline key={item.name} align="center" className="gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: item.color }}
              />
              <Text as="span" size="sm" tone="muted">
                {item.name}
              </Text>
            </Inline>
          ))}
        </Inline>
      ) : null}
    </ChartContainer>
  );
}
