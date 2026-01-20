import { Button, Card, CardBody, Inline, Text } from '@components';

type DashboardErrorBannerProps = {
  message: string;
  onRetry: () => void;
};

export function DashboardErrorBanner(props: DashboardErrorBannerProps) {
  const { message, onRetry } = props;

  return (
    <Card className="border-amber-200 bg-amber-50/60">
      <CardBody>
        <Inline align="center" justify="between" className="gap-4">
          <div className="min-w-0">
            <Text as="div" className="font-semibold text-amber-900">
              Market data is temporarily unavailable.
            </Text>
            <Text as="div" size="sm" className="text-amber-800">
              {message}
            </Text>
          </div>
          <Button variant="secondary" className="shrink-0" onClick={onRetry}>
            Retry
          </Button>
        </Inline>
      </CardBody>
    </Card>
  );
}
