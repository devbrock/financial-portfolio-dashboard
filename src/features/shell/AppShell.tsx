import { useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@components';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import { BottomNav } from './BottomNav';
import type { DashboardNav } from '@/features/dashboard/components/DashboardSidebar';
import { updatePreferences } from '@/features/portfolio/portfolioSlice';

type AppShellProps = {
  activeNav: DashboardNav;
  onNavChange: (next: DashboardNav) => void;
  children: ReactNode;
  liveMessage?: string;
  errorMessage?: string;
  mainId?: string;
};

export function AppShell(props: AppShellProps) {
  const {
    activeNav,
    onNavChange,
    children,
    liveMessage,
    errorMessage,
    mainId = 'main-content',
  } = props;
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.portfolio.preferences.theme);
  const sidebarOpen = useAppSelector(state => state.portfolio.preferences.sidebarOpen);

  const handleSidebarChange = useCallback(
    (nextOpen: boolean) => {
      dispatch(updatePreferences({ sidebarOpen: nextOpen }));
    },
    [dispatch]
  );

  useEffect(() => {
    // Ensure theme also applies to Portals (DropdownMenu/Modal) which render at document.body.
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    return () => {
      root.classList.remove('dark');
    };
  }, [theme]);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={handleSidebarChange}>
      <div
        className={cn(
          // Fixed app shell: sidebar stays pinned; main content scrolls.
          'h-screen overflow-hidden',
          theme === 'dark' ? 'bg-(--ui-bg)' : 'bg-(--ui-surface)',
          theme === 'dark' && 'dark'
        )}
      >
        <a
          href={`#${mainId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:z-50 focus:rounded-xl focus:bg-(--ui-bg) focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg focus:text-(--ui-text-muted)"
        >
          Skip to main content
        </a>
        {liveMessage ? (
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {liveMessage}
          </div>
        ) : null}
        {errorMessage ? (
          <div aria-live="assertive" aria-atomic="true" className="sr-only">
            {errorMessage}
          </div>
        ) : null}
        <div className="mx-auto flex h-full min-h-0 w-full flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:flex-row">
          
            <DashboardSidebar activeNav={activeNav} onNavChange={onNavChange} />
          
          <main
            id={mainId}
            className={cn(
              'min-h-0 min-w-0 flex-1 overflow-y-auto',
              'pb-24' , 'lg:pb-0'
            )}
          >
            {children}
          </main>
        </div>
        <BottomNav activeNav={activeNav} onNavChange={onNavChange} />
      </div>
    </SidebarProvider>
  );
}
