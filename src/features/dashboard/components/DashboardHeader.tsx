import { Heading, Inline, Skeleton, Text } from "@components";
import { formatMoneyUsd } from "@utils/formatMoneyUsd";
import { formatLastUpdated } from "@utils/formatLastUpdated";

type DashboardHeaderProps = {
  userName: string;
  portfolioValue: number;
  lastUpdated: number;
  loading?: boolean;
};

export function DashboardHeader(props: DashboardHeaderProps) {
  const { userName, portfolioValue, lastUpdated, loading = false } = props;

  return (
    <Inline align="center" justify="between" className="gap-3 py-4">
      <div className="min-w-0">
        <Heading as="h2" className="text-xl">
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
              {formatMoneyUsd(portfolioValue)}
            </Text>
            <Text as="div" size="sm" tone="muted" className="mt-1">
              Last updated {formatLastUpdated(lastUpdated)}
            </Text>
          </>
        )}
      </div>
    </Inline>
  );
}
