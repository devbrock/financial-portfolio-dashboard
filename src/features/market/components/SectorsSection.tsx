import { Card, CardBody, CardHeader, Heading, StatusMessage, Text } from '@components';
import { MarketQuoteRow } from './MarketQuotes';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { MarketQuote } from '../hooks/useMarketQuotes';

type SectorsSectionProps = {
  data: MarketQuote[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
};

/**
 * Displays the sector performance snapshot card.
 */
export function SectorsSection({ data, isLoading, isError, error, onRetry }: SectorsSectionProps) {
  return (
    <section aria-label="Sector performance">
      <Card>
        <CardHeader>
          <Heading as="h2" className="text-lg">
            Sector snapshot
          </Heading>
          <Text as="div" size="sm" tone="muted">
            Leadership view across sector ETFs
          </Text>
        </CardHeader>
        <CardBody>
          {isError ? (
            <StatusMessage
              tone="danger"
              title="Unable to load sector data."
              message={getErrorMessage(error, 'Please try again in a moment.')}
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : data.length === 0 ? (
            <StatusMessage
              title="No sector data available."
              message="Check back later for the latest sector moves."
              className="border-dashed bg-transparent"
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.map(item => (
                <MarketQuoteRow
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
