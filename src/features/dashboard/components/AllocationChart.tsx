import { useMemo } from 'react';
import { BarChart, ChartContainer, Skeleton, Text } from '@components';
import { cn } from '@/utils/cn';
import type { AllocationSlice } from '@/types/dashboard';
import { useCurrencyFormatter } from '@/features/portfolio/hooks/useCurrencyFormatter';

type AllocationChartProps = {
  data: readonly AllocationSlice[];
  totalInvested: number;
  loading?: boolean;
  flash?: boolean;
};

export function AllocationChart(props: AllocationChartProps) {
  const { data, totalInvested, loading = false, flash = false } = props;
  const { formatMoney } = useCurrencyFormatter();
  const chartColors = useMemo(() => data.map(slice => slice.color), [data]);

  return (
    <ChartContainer
      title="Diversification"
      subtitle="Current allocation"
      actions={
        <Text as="div" className="text-lg font-semibold">
          {formatMoney(totalInvested)}
        </Text>
      }
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
        <BarChart<AllocationSlice>
          data={data}
          xKey="name"
          barColorKey="color"
          series={[
            {
              key: 'value',
              name: 'Allocation',
              color: chartColors[0] ?? 'var(--ui-primary)',
            },
          ]}
          height={260}
          yTickFormatter={v => `${v}%`}
          tooltipLabelFormatter={l => <span>{String(l)}</span>}
          tooltipValueFormatter={v => <span>{String(v)}%</span>}
        />
      )}
    </ChartContainer>
  );
}
