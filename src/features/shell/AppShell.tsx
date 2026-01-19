import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@components';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/store/hooks';
import { DashboardSidebar } from '@/features/dashboard/components/DashboardSidebar';
import type { DashboardNav } from '@/features/dashboard/components/DashboardSidebar';

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
  const theme = useAppSelector(state => state.portfolio.preferences.theme);

  useEffect(() => {
    // Ensure theme also applies to Portals (DropdownMenu/Modal) which render at document.body.
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    return () => {
      root.classList.remove('dark');
    };
  }, [theme]);

  return (
    <SidebarProvider defaultOpen>
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
          className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:z-50 focus:rounded-xl focus:bg-(--ui-bg) focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
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
        <div className="mx-auto flex h-full min-h-0 w-full gap-6 p-6">
          <DashboardSidebar activeNav={activeNav} onNavChange={onNavChange} />
          <main id={mainId} className="min-h-0 min-w-0 flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
