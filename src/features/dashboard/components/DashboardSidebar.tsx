import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Inline,
  Text,
} from '@components';
import { BotMessageSquare, ChartLine, Home, Newspaper } from 'lucide-react';
import { cn } from '@/utils/cn';
import OrionLogoLight from '@assets/orion_logo_light.svg';
import { useDashboardFooterActions } from '@/features/dashboard/hooks/useDashboardFooterActions';
import { DashboardSidebarFooter } from './DashboardSidebarFooter';

export type DashboardNav = 'Overview' | 'Market' | 'News' | 'OrionGPT';

type DashboardSidebarProps = {
  activeNav: DashboardNav;
  onNavChange: (next: DashboardNav) => void;
};

export function DashboardSidebar(props: DashboardSidebarProps) {
  const { activeNav, onNavChange } = props;
  const { theme, currency, onThemeChange, onCurrencyChange, onExport, onLogout } =
    useDashboardFooterActions();

  return (
    <Sidebar
      collapsible="icon"
      width={260}
      className={cn('overflow-hidden rounded-2xl', 'h-auto w-full lg:h-full lg:w-(--sidebar-width)', "hidden lg:block")}
    >
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

      <DashboardSidebarFooter
        theme={theme}
        currency={currency}
        onThemeChange={onThemeChange}
        onCurrencyChange={onCurrencyChange}
        onExport={onExport}
        onLogout={onLogout}
      />
    </Sidebar>
  );
}
