import type { DashboardNav } from '@/features/dashboard/components/DashboardSidebar';

export const DASHBOARD_NAV_ROUTES: Record<DashboardNav, string> = {
  Overview: '/dashboard',
  Market: '/market',
  News: '/news',
  OrionGPT: '/oriongpt',
};

export const getActiveNav = (pathname: string): DashboardNav => {
  if (pathname.startsWith('/market')) return 'Market';
  if (pathname.startsWith('/news')) return 'News';
  if (pathname.startsWith('/oriongpt')) return 'OrionGPT';
  return 'Overview';
};
