import { Button, Card, CardBody, CardHeader, Heading, Inline, Text } from '@components';
import type { WatchlistCardModel } from '@/types/dashboard';
import { WatchlistCard } from './WatchlistCard';

type DashboardWatchlistSectionProps = {
  watchlist: readonly WatchlistCardModel[];
  flashPrices: boolean;
  onAddWatchlist: () => void;
  onRemoveWatchlist: (id: string) => void;
};

export function DashboardWatchlistSection(props: DashboardWatchlistSectionProps) {
  const { watchlist, flashPrices, onAddWatchlist, onRemoveWatchlist } = props;

  return (
    <section aria-label="My watchlist">
      <Card>
        <CardHeader className="pb-3">
          <Inline align="center" justify="between" className="w-full gap-3">
            <div className="min-w-0">
              <Heading as="h3" className="text-base">
                My Watchlist
              </Heading>
              <Text as="div" size="sm" tone="muted">
                Track live prices for assets you care about.
              </Text>
            </div>
            <Button variant="secondary" size="sm" onClick={onAddWatchlist}>
              Add to Watchlist
            </Button>
          </Inline>
        </CardHeader>
        <CardBody>
          {watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-(--ui-border) px-6 py-10 text-center">
              <Text as="div" className="text-sm font-semibold">
                Your watchlist is empty
              </Text>
              <Text as="div" size="sm" tone="muted">
                Add a stock or crypto to start tracking live prices.
              </Text>
              <Button variant="primary" size="sm" onClick={onAddWatchlist}>
                Add your first asset
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2" aria-label="Watchlist ticker list">
              {watchlist.map(item => (
                <WatchlistCard
                  key={item.id}
                  item={item}
                  flash={flashPrices}
                  onRemove={onRemoveWatchlist}
                />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
