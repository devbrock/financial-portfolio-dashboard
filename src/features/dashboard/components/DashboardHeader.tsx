import { Heading, Inline, Skeleton, Text } from '@components';
import { formatLastUpdated } from '@utils/formatLastUpdated';
import { formatSignedPct } from '@utils/formatSignedPct';
import { useCurrencyFormatter } from '@/features/portfolio/hooks/useCurrencyFormatter';

type DashboardHeaderProps = {
  userName: string;
  portfolioValue: number;
  lastUpdated: number;
  dailyChangeUsd: number;
  dailyChangePct: number;
  loading?: boolean;
};

export function DashboardHeader(props: DashboardHeaderProps) {
  const { userName, portfolioValue, lastUpdated, dailyChangeUsd, dailyChangePct, loading = false } =
    props;

  const { formatMoney } = useCurrencyFormatter();

  const formatSignedMoney = (value: number) => {
    const absValue = Math.abs(value);
    const formatted = formatMoney(absValue);
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <Inline
      align="center"
      justify="between"
      className="gap-3 py-4 animate-in fade-in slide-in-from-top-1 duration-300 motion-reduce:animate-none"
    >
      <div className="min-w-0">
        <Heading as="h1" className="text-xl">
          Welcome back, {userName}!
        </Heading>
        <Text as="div" size="sm" tone="muted">
          Here's a quick look at your portfolio health.
        </Text>
      </div>

      <div className="shrink-0 text-right">
        {loading ? (
          <Skeleton className="h-8 w-40" />
        ) : (
          <>
            <Text as="div" className="text-2xl font-semibold">
              {formatMoney(portfolioValue)}
            </Text>
            <Text as="div" size="sm" tone="muted" className="mt-1">
              Last updated {formatLastUpdated(lastUpdated)}
            </Text>
            <Text as="div" size="sm" tone="muted" className="mt-1">
              Daily P/L{' '}
              <span className={dailyChangeUsd >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                {formatSignedMoney(dailyChangeUsd)}
              </span>{' '}
              ({formatSignedPct(dailyChangePct)})
            </Text>
          </>
        )}
      </div>
    </Inline>
  );
}
