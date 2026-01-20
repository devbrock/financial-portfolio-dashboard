export const formatUpdatedAt = (timestamp: number) => {
  if (!timestamp) return 'Updated: --';
  const formatted = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
  return `Updated at ${formatted}`;
};

export const formatEarningsTime = (value?: string | null) => {
  if (!value) return '--';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'bmo') return 'Before open';
  if (normalized === 'amc') return 'After close';
  return value;
};

export const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(parsed);
};
