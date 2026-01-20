import { useCallback } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  IconButton,
  Inline,
  Text,
} from '@components';
import {
  BotMessageSquare,
  ChartLine,
  Home,
  LogOut,
  Moon,
  Newspaper,
  Settings,
  Sun,
  Check,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import OrionLogoLight from '@assets/orion_logo_light.svg';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updatePreferences } from '@/features/portfolio/portfolioSlice';

export type DashboardNav = 'Overview' | 'Market' | 'News' | 'OrionGPT';

type DashboardSidebarProps = {
  activeNav: DashboardNav;
  onNavChange: (next: DashboardNav) => void;
};

export function DashboardSidebar(props: DashboardSidebarProps) {
  const { activeNav, onNavChange } = props;
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.portfolio.preferences.theme);
  const currency = useAppSelector(state => state.portfolio.preferences.currency);

  const handleThemeChange = useCallback(
    (nextTheme: 'light' | 'dark') => {
      dispatch(updatePreferences({ theme: nextTheme }));
    },
    [dispatch]
  );

  const handleCurrencyChange = useCallback(
    (nextCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY') => {
      dispatch(updatePreferences({ currency: nextCurrency }));
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => undefined, []);
  const footerButtonClassName =
    'group-data-[state=collapsed]/sidebar:w-full group-data-[state=collapsed]/sidebar:justify-center';
  const settingsItemClassName = 'flex items-center justify-between gap-3';

  return (
    <Sidebar collapsible="icon" width={260} className={cn('overflow-hidden rounded-2xl', 'h-full')}>
      <SidebarHeader className="group-data-[state=collapsed]/sidebar:hidden">
        <Inline align="center" className="gap-3 px-1">
          <div className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
            <img src={OrionLogoLight} alt="Orion" className="mx-auto mb-4 h-12 w-auto" />
            <Text as="div" className="font-brand! truncate pt-2 text-2xl font-semibold text-white">
              Orion Wealth
            </Text>
            <Text as="div" size="sm" className="text-white/70">
              Financial Portfolio Dashboard
            </Text>
          </div>
        </Inline>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu aria-label="Primary">
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeNav === 'Overview'}
                  onClick={() => onNavChange('Overview')}
                >
                  <Home />
                  <span data-slot="label">Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeNav === 'Market'}
                  onClick={() => onNavChange('Market')}
                >
                  <ChartLine />
                  <span data-slot="label">Market</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeNav === 'News'}
                  onClick={() => onNavChange('News')}
                >
                  <Newspaper />
                  <span data-slot="label">News</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeNav === 'OrionGPT'}
                  onClick={() => onNavChange('OrionGPT')}
                >
                  <BotMessageSquare />
                  <span data-slot="label">OrionGPT</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Inline
          align="center"
          className={cn(
            'gap-2 px-1',
            'group-data-[state=collapsed]/sidebar:flex-col group-data-[state=collapsed]/sidebar:items-stretch'
          )}
        >
          <SidebarTrigger
            ariaLabel="Toggle sidebar"
            className={cn(
              footerButtonClassName,
              'h-9 w-9 rounded-xl border border-white/10 bg-white/10 text-white hover:bg-white/15'
            )}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                ariaLabel="Open settings"
                variant="inverse"
                size="sm"
                icon={<Settings />}
                className={footerButtonClassName}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent minWidth={220}>
              <Text as="div" size="xs" className="px-3 py-2 uppercase tracking-wide text-(--ui-text-muted)">
                Theme
              </Text>
              <DropdownMenuItem
                className={settingsItemClassName}
                onClick={() => handleThemeChange('light')}
              >
                <span className="inline-flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </span>
                {theme === 'light' ? <Check className="h-4 w-4" /> : null}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={settingsItemClassName}
                onClick={() => handleThemeChange('dark')}
              >
                <span className="inline-flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </span>
                {theme === 'dark' ? <Check className="h-4 w-4" /> : null}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Text as="div" size="xs" className="px-3 py-2 uppercase tracking-wide text-(--ui-text-muted)">
                Currency
              </Text>
              {(['USD', 'EUR', 'GBP', 'JPY'] as const).map(code => (
                <DropdownMenuItem
                  key={code}
                  className={settingsItemClassName}
                  onClick={() => handleCurrencyChange(code)}
                >
                  <span className="inline-flex items-center gap-2">
                    {code}
                  </span>
                  {currency === code ? <Check className="h-4 w-4" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <IconButton
            ariaLabel="Log out"
            variant="inverse"
            size="sm"
            onClick={handleLogout}
            icon={<LogOut />}
            className={footerButtonClassName}
          />
        </Inline>
      </SidebarFooter>
    </Sidebar>
  );
}
