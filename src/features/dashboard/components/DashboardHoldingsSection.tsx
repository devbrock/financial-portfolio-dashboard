import { Button, Card, CardBody, CardHeader, Heading, Inline, Input, Text } from '@components';
import { Plus, Search } from 'lucide-react';
import type { HoldingRow, SortDir, SortKey } from '@/types/dashboard';
import { EmptyHoldings } from './EmptyHoldings';
import { HoldingsMobileCard } from './HoldingsMobileCard';
import { HoldingsTable } from './HoldingsTable';

type DashboardHoldingsSectionProps = {
  holdingsQuery: string;
  onHoldingsQueryChange: (value: string) => void;
  onAddAsset: () => void;
  visibleHoldings: readonly HoldingRow[];
  onSort: (key: SortKey) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onRemove: (id: string) => void;
  flashPrices: boolean;
};

export function DashboardHoldingsSection(props: DashboardHoldingsSectionProps) {
  const {
    holdingsQuery,
    onHoldingsQueryChange,
    onAddAsset,
    visibleHoldings,
    onSort,
    sortKey,
    sortDir,
    onRemove,
    flashPrices,
  } = props;

  return (
    <section aria-label="Holdings">
      <Card>
        <CardHeader className="pb-3">
          <Inline align="center" justify="between" className="w-full gap-3">
            <div className="min-w-0 flex-1">
              <Heading as="h3" className="text-base">
                My Holdings
              </Heading>
              <Text as="div" size="sm" tone="muted">
                Track transactions, positions, performance and status.
              </Text>
            </div>

            <div className="flex w-full flex-1 justify-center">
              <div className="relative w-full max-w-[280px]">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-(--ui-text-muted)">
                  <Search />
                </span>
                <Input
                  aria-label="Search holdings"
                  placeholder="Search..."
                  value={holdingsQuery}
                  onChange={e => onHoldingsQueryChange(e.currentTarget.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-1 justify-end">
              <Button variant="primary" leftIcon={<Plus />} onClick={onAddAsset}>
                Add Asset
              </Button>
            </div>
          </Inline>
        </CardHeader>

        <CardBody className="space-y-4">
          <div className="hidden md:block">
            {visibleHoldings.length === 0 ? (
              <EmptyHoldings onAddHolding={onAddAsset} />
            ) : (
              <HoldingsTable
                holdings={visibleHoldings}
                onSort={onSort}
                sortKey={sortKey}
                sortDir={sortDir}
                onRemove={onRemove}
                flash={flashPrices}
              />
            )}
          </div>

          <div className="md:hidden">
            {visibleHoldings.length === 0 ? (
              <EmptyHoldings onAddHolding={onAddAsset} />
            ) : (
              <div className="space-y-4!">
                {visibleHoldings.map(h => (
                  <HoldingsMobileCard
                    key={h.id}
                    holding={h}
                    onRemove={onRemove}
                    flash={flashPrices}
                  />
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
