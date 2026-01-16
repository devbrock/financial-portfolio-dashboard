import { Button, Heading, Inline, Skeleton, Text } from "@components";
import { Plus } from "lucide-react";
import { formatMoneyUsd } from "@utils/formatMoneyUsd";
import { formatLastUpdated } from "@utils/formatLastUpdated";

type DashboardHeaderProps = {
  userName: string;
  portfolioValue: number;
  lastUpdated: number;
  onAddAsset: () => void;
  loading?: boolean;
};

export function DashboardHeader(props: DashboardHeaderProps) {
  const {
    userName,
    portfolioValue,
    lastUpdated,
    onAddAsset,
    loading = false,
  } = props;

  return (
    <Inline align="center" justify="between" className="gap-3">
      <div className="min-w-0">
        <Heading as="h2" className="text-xl">
          Welcome back, {userName}!
        </Heading>
        <Text as="div" size="sm" tone="muted">
          Here's a quick look at your portfolio health.
        </Text>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-48" />
        ) : (
          <>
            <Text as="div" className="mt-2 text-2xl font-semibold">
              {formatMoneyUsd(portfolioValue)}
            </Text>
            <Text as="div" size="sm" tone="muted" className="mt-1">
              Last updated {formatLastUpdated(lastUpdated)}
            </Text>
          </>
        )}
      </div>

      <Inline align="center" className="shrink-0 gap-2">
        <Button variant="primary" leftIcon={<Plus />} onClick={onAddAsset}>
          Add Asset
        </Button>
      </Inline>
    </Inline>
  );
}
