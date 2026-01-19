import { useCallback, useMemo } from 'react';
import { Container, Stack } from '@components';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AppShell } from '@/features/shell/AppShell';
import { DASHBOARD_NAV_ROUTES, getActiveNav } from '@/features/navigation/dashboardNav';
import { PageHeader } from '@/features/shell/PageHeader';

export function Assistant() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const activeNav = useMemo(() => getActiveNav(pathname), [pathname]);
  const handleNavChange = useCallback(
    (next: keyof typeof DASHBOARD_NAV_ROUTES) => navigate({ to: DASHBOARD_NAV_ROUTES[next] }),
    [navigate]
  );

  return (
    <AppShell activeNav={activeNav} onNavChange={handleNavChange}>
      <Container className="max-w-none px-0">
        <Stack gap="lg">
          <PageHeader
            title="AI Assistant"
            subtitle="Your personalized market assistant will be available here."
          />
        </Stack>
      </Container>
    </AppShell>
  );
}
