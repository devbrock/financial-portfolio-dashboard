import { useCallback } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
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
  Sun,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import OrionLogoLight from '@assets/orion_logo_light.svg';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updatePreferences } from '@/features/portfolio/portfolioSlice';

export type DashboardNav = 'Overview' | 'Market' | 'News' | 'AI Assistant';

type DashboardSidebarProps = {
  activeNav: DashboardNav;
  onNavChange: (next: DashboardNav) => void;
};

export function DashboardSidebar(props: DashboardSidebarProps) {
  const { activeNav, onNavChange } = props;
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.portfolio.preferences.theme);

  const toggleTheme = useCallback(() => {
    dispatch(updatePreferences({ theme: theme === 'dark' ? 'light' : 'dark' }));
  }, [dispatch, theme]);

  const handleLogout = useCallback(() => undefined, []);
  const footerButtonClassName =
    'group-data-[state=collapsed]/sidebar:w-full group-data-[state=collapsed]/sidebar:justify-center';

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
                  isActive={activeNav === 'AI Assistant'}
                  onClick={() => onNavChange('AI Assistant')}
                >
                  <BotMessageSquare />
                  <span data-slot="label">AI Assistant</span>
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
          <SidebarTrigger ariaLabel="Toggle sidebar" className={footerButtonClassName} />
          <IconButton
            ariaLabel={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            icon={theme === 'dark' ? <Sun /> : <Moon />}
            className={footerButtonClassName}
          />
          <IconButton
            ariaLabel="Log out"
            variant="ghost"
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
