import { createFileRoute } from '@tanstack/react-router';
import { Market } from '@/features/market/Market';
import { RequireAuth } from '@/features/auth/RequireAuth';

export const Route = createFileRoute('/market')({
  component: MarketComponent,
});

function MarketComponent() {
  return (
    <RequireAuth>
      <Market />
    </RequireAuth>
  );
}
