import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Inline,
  SidebarFooter,
  SidebarTrigger,
  Text,
  Tooltip,
} from '@components';
import { Bell, BellOff, Check, Download, LogOut, Moon, Settings, Sun } from 'lucide-react';
import { cn } from '@/utils/cn';

type DashboardSidebarFooterProps = {
  theme: 'light' | 'dark';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  notificationsEnabled: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  onThemeChange: (nextTheme: 'light' | 'dark') => void;
  onCurrencyChange: (nextCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY') => void;
  onToggleNotifications: () => void;
  onExport: () => void;
  onLogout: () => void;
};

export function DashboardSidebarFooter(props: DashboardSidebarFooterProps) {
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
  } = props;
  const footerButtonClassName =
    'group-data-[state=collapsed]/sidebar:w-full group-data-[state=collapsed]/sidebar:justify-center';
  const settingsItemClassName = 'flex items-center justify-between gap-3';

  return (
    <SidebarFooter>
      <Inline
        align="center"
        className={cn(
          'gap-2 px-1',
          'group-data-[state=collapsed]/sidebar:flex-col group-data-[state=collapsed]/sidebar:items-stretch'
        )}
      >
        <Tooltip content="Toggle sidebar">
          <SidebarTrigger
            ariaLabel="Toggle sidebar"
            className={cn(
              footerButtonClassName,
              'h-9 w-9 rounded-xl border border-white/10 bg-white/10 text-white hover:bg-white/15'
            )}
          />
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Tooltip content="Settings">
              <IconButton
                ariaLabel="Open settings"
                variant="inverse"
                size="sm"
                icon={<Settings />}
                className={footerButtonClassName}
              />
            </Tooltip>
          </DropdownMenuTrigger>
          <DropdownMenuContent minWidth={220}>
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
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip content="Download report">
          <IconButton
            ariaLabel="Download portfolio report"
            variant="inverse"
            size="sm"
            onClick={onExport}
            icon={<Download />}
            className={footerButtonClassName}
          />
        </Tooltip>
        <Tooltip content="Log out">
          <IconButton
            ariaLabel="Log out"
            variant="inverse"
            size="sm"
            onClick={onLogout}
            icon={<LogOut />}
            className={footerButtonClassName}
          />
        </Tooltip>
      </Inline>
    </SidebarFooter>
  );
}
