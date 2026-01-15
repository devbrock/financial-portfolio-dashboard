import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "./index";
import { Button } from "../Button/Button";

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 10.5l8-6 8 6V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 4h16v12h-5l-2 3h-2l-2-3H4V4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <circle cx="6" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18" cy="12" r="1.6" />
    </svg>
  );
}

const meta: Meta = {
  title: "Navigation/Sidebar",
};
export default meta;

type Story = StoryObj;

function CollapsibleToIconsExample() {
  const [active, setActive] = React.useState<"home" | "inbox">("home");

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-[480px] w-full overflow-hidden rounded-2xl border border-(--ui-border) bg-(--ui-bg)">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">
                <span data-slot="label">Orion</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={active === "home"}
                      onClick={() => setActive("home")}
                    >
                      <HomeIcon />
                      <span data-slot="label">Home</span>
                      <SidebarMenuAction aria-label="More">
                        <MoreIcon />
                      </SidebarMenuAction>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={active === "inbox"}
                      onClick={() => setActive("inbox")}
                    >
                      <InboxIcon />
                      <span data-slot="label">Inbox</span>
                      <SidebarMenuAction aria-label="More">
                        <MoreIcon />
                      </SidebarMenuAction>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2">
                  <Button variant="secondary" className="w-full">
                    <span data-slot="label">New report</span>
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="text-xs text-white/70">
              <span data-slot="label">Signed in</span>
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <main className="flex-1 p-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div className="text-sm text-(--ui-text-muted)">
              Content area (toggle sidebar)
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export const CollapsibleToIcons: Story = {
  render: () => <CollapsibleToIconsExample />,
};
