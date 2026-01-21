import { useMemo } from 'react';
import {
  AreaChart,
  ChartContainer,
  Chip,
  DeltaPill,
  Inline,
  Skeleton,
  StatusMessage,
  Text,
} from '@components';
import { cn } from '@/utils/cn';
import type { PerformancePoint } from '@/types/dashboard';
import { formatSignedPct } from '@utils/formatSignedPct';
import { usePortfolioHistoricalData } from '@/features/portfolio/hooks/usePortfolioHistoricalData';
import { useCurrencyFormatter } from '@/features/portfolio/hooks/useCurrencyFormatter';
import { getErrorMessage } from '@/utils/getErrorMessage';

type PerformanceChartProps = {
  range: '7d' | '30d' | '90d' | '1y';
  onRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
  flash?: boolean;
};

export function PerformanceChart(props: PerformanceChartProps) {
  const { range, onRangeChange, flash = false } = props;
  const { data, isLoading, isError, error, refetch } = usePortfolioHistoricalData(range);
  const { formatMoney, formatCompactMoney } = useCurrencyFormatter();

  const { totalValue, changePct } = useMemo(() => {
    if (data.length === 0) return { totalValue: 0, changePct: 0 };

    const firstNonZero = data.find(point => point.value > 0)?.value ?? data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = lastValue - firstNonZero;
    const percentage = firstNonZero !== 0 ? (change / firstNonZero) * 100 : 0;

    return { totalValue: lastValue, changePct: percentage };
  }, [data]);

  return (
    <ChartContainer
      title="Portfolio value"
      subtitle="Performance"
      className={cn(
        flash && 'animate-pulse shadow-[0_0_0_2px_rgba(16,185,129,0.2)] ring-2 ring-emerald-200/80'
      )}
      actions={
        <Inline align="center" className="gap-2">
          <Chip selected={range === '7d'} onClick={() => onRangeChange('7d')}>
            7D
          </Chip>
          <Chip selected={range === '30d'} onClick={() => onRangeChange('30d')}>
            30D
          </Chip>
          <Chip selected={range === '90d'} onClick={() => onRangeChange('90d')}>
            90D
          </Chip>
          <Chip selected={range === '1y'} onClick={() => onRangeChange('1y')}>
            1Y
          </Chip>
        </Inline>
      }
      aria-busy={isLoading || undefined}
    >
      {isLoading ? (
        <div className="flex flex-col gap-4 pt-2" aria-hidden="true">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-[260px] w-full" />
        </div>
      ) : isError ? (
        <StatusMessage
          tone="danger"
          title="Historical data is unavailable right now."
          message={getErrorMessage(error, 'Please try again in a moment.')}
          actionLabel="Retry"
          onAction={() => {
            void refetch();
          }}
        />
      ) : data.length === 0 ? (
        <StatusMessage
          tone="info"
          title="No historical data yet."
          message="Add holdings to see portfolio performance over time."
          className="border-dashed bg-transparent"
        />
      ) : (
        <>
          <Inline align="end" justify="between" className="mb-3 my-4! gap-3">
            <div>
              <Text as="div" className="text-2xl font-semibold">
                {formatMoney(totalValue)}
              </Text>
              <Text as="div" size="sm" tone="muted">
                Portfolio value
              </Text>
            </div>
            <DeltaPill
              direction={changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat'}
              tone={changePct > 0 ? 'success' : changePct < 0 ? 'danger' : 'neutral'}
            >
              {formatSignedPct(changePct)}
            </DeltaPill>
          </Inline>
          <AreaChart<PerformancePoint>
            data={data}
            xKey="date"
            series={[
              {
                key: 'value',
                name: 'Portfolio value',
                color: 'var(--ui-primary)',
              },
            ]}
            yTickFormatter={v => (typeof v === 'number' ? formatCompactMoney(v) : String(v))}
          />
        </>
      )}
    </ChartContainer>
  );
}
