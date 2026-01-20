import { createFileRoute } from '@tanstack/react-router';
import { Dashboard } from '@features/dashboard/Dashboard';
import { RequireAuth } from '@/features/auth/RequireAuth';

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
});

function DashboardComponent() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
