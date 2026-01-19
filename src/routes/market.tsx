import { createFileRoute } from '@tanstack/react-router';
import { Market } from '@/features/market/Market';

export const Route = createFileRoute('/market')({
  component: MarketComponent,
});

function MarketComponent() {
  return <Market />;
}
