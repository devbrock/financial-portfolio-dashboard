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
  Inline,
  Text,
  Divider,
} from "@components";
import {
  BotMessageSquare,
  ChartLine,
  Folder,
  HelpCircle,
  Home,
  Newspaper,
} from "lucide-react";
import { cn } from "@/utils/cn";
import OrionLogoLight from "@assets/orion_logo_light.svg";

export type DashboardNav =
  | "Overview"
  | "Portfolio"
  | "Market"
  | "News"
  | "AI Assistant";

type DashboardSidebarProps = {
  activeNav: DashboardNav;
  onNavChange: (next: DashboardNav) => void;
};

export function DashboardSidebar(props: DashboardSidebarProps) {
  const { activeNav, onNavChange } = props;

  return (
    <Sidebar
      collapsible="icon"
      width={260}
      className={cn("rounded-2xl overflow-hidden", "h-full")}
    >
      <SidebarHeader className="group-data-[state=collapsed]/sidebar:hidden">
        <Inline align="center" className="gap-3 px-1">
          <div className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
            <img
              src={OrionLogoLight}
              alt="Orion"
              className="h-12 w-auto mx-auto mb-4"
            />
            <Text
              as="div"
              className="truncate font-semibold text-white font-brand! text-2xl"
            >
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
                  isActive={activeNav === "Overview"}
                  onClick={() => onNavChange("Overview")}
                >
                  <Home />
                  <span data-slot="label">Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeNav === "Portfolio"}
                  onClick={() => onNavChange("Portfolio")}
                >
                  <Folder />
                  <span data-slot="label">Portfolio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeNav === "Market"}
                  onClick={() => onNavChange("Market")}
                >
                  <ChartLine />
                  <span data-slot="label">Market</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeNav === "News"}
                  onClick={() => onNavChange("News")}
                >
                  <Newspaper />
                  <span data-slot="label">News</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeNav === "AI Assistant"}
                  onClick={() => onNavChange("AI Assistant")}
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => undefined}>
              <HelpCircle />
              <span data-slot="label">Help &amp; Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
