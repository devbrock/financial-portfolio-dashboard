import { Inline, Text } from '@components';
import type { FinnhubNewsItem } from '@/types/finnhub';

/**
 * Formats a Unix timestamp to a readable date/time string.
 */
function formatNewsTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

type NewsCardProps = {
  item: FinnhubNewsItem;
};

/**
 * Displays a single news item as a clickable card with optional image.
 */
export function NewsCard({ item }: NewsCardProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group flex gap-4 rounded-2xl border border-(--ui-border) bg-(--ui-bg) p-4 transition-shadow duration-200 hover:border-(--ui-primary) hover:shadow-sm motion-reduce:transition-none"
    >
      {item.image ? (
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-(--ui-surface)">
          <img src={item.image} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="min-w-0">
        <Text as="div" className="line-clamp-2 text-sm font-semibold">
          {item.headline}
        </Text>
        <Text as="div" size="sm" tone="muted" className="mt-1 line-clamp-2">
          {item.summary}
        </Text>
        <Inline align="center" className="mt-2 gap-2 text-xs text-(--ui-text-muted)">
          <span>{item.source}</span>
          <span aria-hidden="true">•</span>
          <span>{formatNewsTime(item.datetime)}</span>
        </Inline>
      </div>
    </a>
  );
}
