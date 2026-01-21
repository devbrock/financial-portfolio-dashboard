import { DeltaPill, Inline, Skeleton, Text } from '@components';
import { useCurrencyFormatter } from '@/features/portfolio/hooks/useCurrencyFormatter';
import { formatSignedPct } from '@/utils/formatSignedPct';

type QuoteProps = {
  name: string;
  symbol: string;
  quote?: { c: number; dp: number };
  loading: boolean;
};

export function MarketQuoteTile(props: QuoteProps) {
  const { name, symbol, quote, loading } = props;
  const { formatMoney } = useCurrencyFormatter();

  return (
    <div className="rounded-2xl border border-(--ui-border) bg-(--ui-bg) p-4 transition-shadow duration-200 hover:shadow-sm motion-reduce:transition-none">
      <Inline align="center" justify="between" className="gap-2">
        <div>
          <Text as="div" className="text-sm font-semibold">
            {name}
          </Text>
          <Text as="div" size="sm" tone="muted">
            {symbol}
          </Text>
        </div>
        {loading ? <Skeleton className="h-8 w-20" /> : null}
      </Inline>
      {!loading ? (
        quote ? (
          <Inline align="end" justify="between" className="mt-4 gap-2">
            <Text as="div" className="text-xl font-semibold">
              {formatMoney(quote.c)}
            </Text>
            <DeltaPill
              direction={quote.dp > 0 ? 'up' : quote.dp < 0 ? 'down' : 'flat'}
              tone={quote.dp > 0 ? 'success' : quote.dp < 0 ? 'danger' : 'neutral'}
            >
              {formatSignedPct(quote.dp)}
            </DeltaPill>
          </Inline>
        ) : (
          <Text as="div" size="sm" tone="muted" className="mt-4">
            Data unavailable
          </Text>
        )
      ) : null}
    </div>
  );
}

export function MarketQuoteRow(props: QuoteProps) {
  const { name, symbol, quote, loading } = props;
  const { formatMoney } = useCurrencyFormatter();

  return (
    <div className="flex items-center justify-between rounded-2xl border border-(--ui-border) bg-(--ui-bg) px-4 py-3 transition-colors duration-200 hover:border-(--ui-primary) motion-reduce:transition-none">
      <div>
        <Text as="div" className="text-sm font-semibold">
          {name}
        </Text>
        <Text as="div" size="sm" tone="muted">
          {symbol}
        </Text>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-24" />
      ) : quote ? (
        <Inline align="center" className="gap-3">
          <Text as="div" className="text-sm font-semibold">
            {formatMoney(quote.c)}
          </Text>
          <DeltaPill
            direction={quote.dp > 0 ? 'up' : quote.dp < 0 ? 'down' : 'flat'}
            tone={quote.dp > 0 ? 'success' : quote.dp < 0 ? 'danger' : 'neutral'}
          >
            {formatSignedPct(quote.dp)}
          </DeltaPill>
        </Inline>
      ) : (
        <Text as="div" size="sm" tone="muted">
          --
        </Text>
      )}
    </div>
  );
}
