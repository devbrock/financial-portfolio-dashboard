import { Card, CardBody, DeltaPill, IconButton, Inline, Text } from '@components';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { WatchlistCardModel } from '@/types/dashboard';
import { formatMoneyUsd } from '@utils/formatMoneyUsd';
import { formatSignedPct } from '@utils/formatSignedPct';

type WatchlistCardProps = {
  item: WatchlistCardModel;
  onRemove: (id: string) => void;
  flash?: boolean;
};

export function WatchlistCard(props: WatchlistCardProps) {
  const { item, onRemove, flash = false } = props;

  return (
    <Card
      elevation="sm"
      className={cn(
        'w-72 shrink-0 p-5',
        'transition-shadow duration-200 motion-reduce:transition-none',
        'bg-(--ui-bg)',
        flash && 'animate-pulse shadow-[0_0_0_2px_rgba(16,185,129,0.2)] ring-2 ring-emerald-200/80'
      )}
    >
      <CardBody className="space-y-4">
        <Inline align="center" justify="between" className="gap-3">
          <Inline align="center" className="min-w-0 gap-3">
            <div
              className={cn(
                'grid h-10 w-10 place-items-center rounded-2xl',
                'border border-(--ui-border) bg-(--ui-surface)',
                item.logo && 'overflow-hidden'
              )}
              aria-hidden="true"
            >
              {item.logo ? (
                <img src={item.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold">{item.name.slice(0, 1)}</span>
              )}
            </div>
            <div className="min-w-0">
              <Text as="div" className="truncate font-semibold">
                {item.name}
              </Text>
              <Text as="div" size="sm" tone="muted" className="truncate">
                {item.ticker}
              </Text>
            </div>
          </Inline>

          <IconButton
            ariaLabel={`Remove ${item.ticker} from watchlist`}
            variant="ghost"
            size="sm"
            icon={<X />}
            onClick={() => onRemove(item.id)}
          />
        </Inline>

        <Inline align="end" justify="between" className="gap-3">
          <div>
            <Text as="div" className="text-2xl font-semibold">
              {formatMoneyUsd(item.priceUsd)}
            </Text>
            <Text as="div" size="sm" tone="muted">
              Live price
            </Text>
          </div>
          <DeltaPill
            direction={item.changePct > 0 ? 'up' : item.changePct < 0 ? 'down' : 'flat'}
            tone={item.changePct > 0 ? 'success' : item.changePct < 0 ? 'danger' : 'neutral'}
          >
            {formatSignedPct(item.changePct)}
          </DeltaPill>
        </Inline>
      </CardBody>
    </Card>
  );
}
