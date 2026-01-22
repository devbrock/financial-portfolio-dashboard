import { Card, CardBody, CardHeader, Heading, StatusMessage, Text } from '@components';
import { MarketQuoteTile } from './MarketQuotes';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { MarketQuote } from '../hooks/useMarketQuotes';

type IndicesSectionProps = {
  data: MarketQuote[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
};

/**
 * Displays the major indices overview card.
 */
export function IndicesSection({ data, isLoading, isError, error, onRetry }: IndicesSectionProps) {
  return (
    <section aria-label="Major indices">
      <Card>
        <CardHeader>
          <Heading as="h2" className="text-lg">
            Indices overview
          </Heading>
          <Text as="div" size="sm" tone="muted" className="text-right">
            Hourly snapshots of key U.S. benchmarks
          </Text>
        </CardHeader>
        <CardBody>
          {isError ? (
            <StatusMessage
              tone="danger"
              title="Unable to load index data."
              message={getErrorMessage(error, 'Please try again in a moment.')}
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : data.length === 0 ? (
            <StatusMessage
              title="No index data available."
              message="Check back later for the latest benchmarks."
              className="border-dashed bg-transparent"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {data.map(item => (
                <MarketQuoteTile
                  key={item.symbol}
                  name={item.name}
                  symbol={item.symbol}
                  quote={item.quote}
                  loading={isLoading}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
