import {
  Bell,
  BellOff,
  BotMessageSquare,
  ChartLine,
  Check,
  Download,
  Home,
  LogOut,
  Moon,
  Newspaper,
  Settings,
  Sun,
} from 'lucide-react';
import { cn } from '@utils/cn';
import type { DashboardNav } from '@/features/dashboard/components/DashboardSidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Text,
} from '@components';
import { useDashboardFooterActions } from '@/features/dashboard/hooks/useDashboardFooterActions';

type BottomNavProps = {
  activeNav: DashboardNav;
  onNavChange: (next: DashboardNav) => void;
};

const NAV_ITEMS: Array<{ key: DashboardNav; label: string; icon: React.ReactNode }> = [
  { key: 'Overview', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { key: 'Market', label: 'Market', icon: <ChartLine className="h-5 w-5" /> },
  { key: 'News', label: 'News', icon: <Newspaper className="h-5 w-5" /> },
  { key: 'OrionGPT', label: 'Assistant', icon: <BotMessageSquare className="h-5 w-5" /> },
];

export function BottomNav(props: BottomNavProps) {
  const { activeNav, onNavChange } = props;
  const {
    theme,
    currency,
    notificationsEnabled,
    notificationPermission,
    onThemeChange,
    onCurrencyChange,
    onToggleNotifications,
    onExport,
    onLogout,
  } = useDashboardFooterActions();
  const settingsItemClassName = 'flex items-center justify-between gap-3';

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 lg:hidden',
        'border-t border-white/10 bg-(--ui-inverse-bg) text-(--ui-inverse-text)',
        'backdrop-blur'
      )}
    >
      <div className="mx-auto grid w-full grid-cols-5 items-center gap-0 px-4 py-3">
        {NAV_ITEMS.map(item => {
          const isActive = item.key === activeNav;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavChange(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold',
                'text-white/90 hover:bg-white/10 hover:text-white',
                'focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-inverse-bg) focus-visible:outline-none',
                isActive && 'bg-white/12 text-white'
              )}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'group flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold',
                'text-white/90 hover:bg-white/10 hover:text-white',
                'focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-inverse-bg) focus-visible:outline-none'
              )}
            >
              <span aria-hidden="true">
                <Settings className="h-5 w-5" />
              </span>
              <span>More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent minWidth={220} align="end">
            <Text
              as="div"
              size="caption"
              className="px-3 py-2 tracking-wide text-(--ui-text-muted) uppercase"
            >
              Theme
            </Text>
            <DropdownMenuItem
              className={settingsItemClassName}
              onClick={() => onThemeChange('light')}
            >
              <span className="inline-flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Light
              </span>
              {theme === 'light' ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
            <DropdownMenuItem
              className={settingsItemClassName}
              onClick={() => onThemeChange('dark')}
            >
              <span className="inline-flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Dark
              </span>
              {theme === 'dark' ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Text
              as="div"
              size="caption"
              className="px-3 py-2 tracking-wide text-(--ui-text-muted) uppercase"
            >
              Currency
            </Text>
            {(['USD', 'EUR', 'GBP', 'JPY'] as const).map(code => (
              <DropdownMenuItem
                key={code}
                className={settingsItemClassName}
                onClick={() => onCurrencyChange(code)}
              >
                <span className="inline-flex items-center gap-2">{code}</span>
                {currency === code ? <Check className="h-4 w-4" /> : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Text
              as="div"
              size="caption"
              className="px-3 py-2 tracking-wide text-(--ui-text-muted) uppercase"
            >
              Notifications
            </Text>
            <DropdownMenuItem
              className={settingsItemClassName}
              onClick={onToggleNotifications}
              disabled={notificationPermission === 'denied'}
            >
              <span className="inline-flex items-center gap-2">
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </span>
              {notificationsEnabled ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
            {notificationPermission === 'denied' ? (
              <Text as="div" size="caption" className="px-3 py-1 text-(--ui-text-muted)">
                Notifications blocked by browser
              </Text>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExport}>
              <span className="inline-flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download report
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}>
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Log out
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
