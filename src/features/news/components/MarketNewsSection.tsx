import { Card, CardBody, CardHeader, Heading, Skeleton, StatusMessage, Text } from '@components';
import { NewsCard } from './NewsCard';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { FinnhubNewsItem } from '@/types/finnhub';

type MarketNewsSectionProps = {
  data: FinnhubNewsItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
};

/**
 * Displays the market headlines section.
 */
export function MarketNewsSection({
  data,
  isLoading,
  isError,
  error,
  onRetry,
}: MarketNewsSectionProps) {
  return (
    <section aria-label="Market news">
      <Card>
        <CardHeader>
          <Heading as="h2" className="text-lg">
            Market headlines
          </Heading>
          <Text as="div" size="sm" tone="muted">
            Latest broad-market stories
          </Text>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError ? (
            <StatusMessage
              tone="danger"
              title="Unable to load market news."
              message={getErrorMessage(error, 'Please try again in a moment.')}
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : data.length === 0 ? (
            <StatusMessage
              title="No market headlines yet."
              message="Check back later for the latest stories."
              className="border-dashed bg-transparent"
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {data.slice(0, 6).map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
