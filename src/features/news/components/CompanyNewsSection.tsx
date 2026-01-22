import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Inline,
  Skeleton,
  StatusMessage,
  Text,
} from '@components';
import { NewsCard } from './NewsCard';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { FinnhubNewsItem } from '@/types/finnhub';

type CompanyNewsSectionProps = {
  symbols: string[];
  newsBySymbol: Map<string, FinnhubNewsItem[]>;
  newsCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
};

/**
 * Displays company-specific news for holdings and watchlist symbols.
 */
export function CompanyNewsSection({
  symbols,
  newsBySymbol,
  newsCount,
  isLoading,
  isError,
  error,
  onRetry,
}: CompanyNewsSectionProps) {
  return (
    <section aria-label="Company news">
      <Card>
        <CardHeader>
          <Heading as="h2" className="text-lg">
            Company news
          </Heading>
          <Text as="div" size="sm" tone="muted">
            Updates for your holdings and watchlist
          </Text>
        </CardHeader>
        <CardBody className="space-y-4">
          {symbols.length === 0 ? (
            <StatusMessage
              title="Follow a company to see updates."
              message="Add stock holdings or watchlist symbols to personalize this feed."
              className="border-dashed bg-transparent"
            />
          ) : isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError ? (
            <StatusMessage
              tone="danger"
              title="Unable to load company news."
              message={getErrorMessage(error, 'Please try again in a moment.')}
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : newsCount === 0 ? (
            <StatusMessage
              title="No company news yet."
              message="We'll show updates as soon as new stories are published."
              className="border-dashed bg-transparent"
            />
          ) : (
            symbols.map(symbol => (
              <div key={symbol} className="space-y-4">
                <Inline align="center" justify="between" className="pt-4 pb-2">
                  <Heading as="h3" className="text-base">
                    {symbol}
                  </Heading>
                  <Text as="div" size="sm" tone="muted">
                    Last 7 days
                  </Text>
                </Inline>
                <div className="grid gap-3 lg:grid-cols-2">
                  {(newsBySymbol.get(symbol) ?? []).slice(0, 4).map(item => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </section>
  );
}

