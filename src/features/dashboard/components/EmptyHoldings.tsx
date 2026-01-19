import { Button, Stack, Text } from '@components';
import { cn } from '@/utils/cn';

type EmptyHoldingsProps = {
  onAddHolding: () => void;
};

export function EmptyHoldings(props: EmptyHoldingsProps) {
  const { onAddHolding } = props;

  return (
    <div className={cn('rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6')}>
      <Stack gap="md">
        <div>
          <Text as="div" className="font-semibold">
            No holdings found
          </Text>
          <Text as="div" size="sm" tone="muted">
            Adjust your search, or add positions to start tracking performance.
          </Text>
        </div>
        <Button variant="primary" onClick={onAddHolding}>
          Add holding
        </Button>
      </Stack>
    </div>
  );
}
