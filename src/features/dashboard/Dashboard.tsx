import { useMemo, useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  IconButton,
  Inline,
  Input,
  Modal,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Stack,
  Text,
} from "@components";
import {
  Bell,
  ChartLine,
  ChevronDown,
  Folder,
  HelpCircle,
  Home,
  Moon,
  Newspaper,
  Search,
  Sun,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { SortKey, SortDir, HoldingRow } from "@/types/dashboard";
import { clampNumber } from "@utils/clampNumber";
import { compareStrings } from "@utils/compareStrings";
import { useDashboardData } from "./hooks/useDashboardData";
import {
  AssetSummaryCard,
  DashboardHeader,
  PerformanceChart,
  AllocationChart,
  HoldingsTable,
  HoldingsMobileCard,
  EmptyHoldings,
} from "./components";
import { useAppDispatch } from "@/store/hooks";
import { removeHolding } from "@/features/portfolio/portfolioSlice";

type ThemeMode = "light" | "dark";

export function Dashboard() {
  const dispatch = useAppDispatch();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [range, setRange] = useState<"month" | "week" | "day">("month");
  const [holdingsQuery, setHoldingsQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [activeNav, setActiveNav] = useState<
    "Overview" | "Portfolio" | "Wallet" | "Market" | "Community" | "News"
  >("Overview");
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState(12);

  // Get dashboard data
  const {
    assets,
    perfDaily,
    perfWeekly,
    perfMonthly,
    allocation,
    holdings,
    metrics,
    dataUpdatedAt,
  } = useDashboardData();

  // Update "last updated" timer
  useEffect(() => {
    const t = window.setInterval(() => {
      setLastUpdatedSeconds((s) => clampNumber(s + 1, 0, 999));
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  // Reset timer when data updates
  useEffect(() => {
    if (dataUpdatedAt > 0) {
      setLastUpdatedSeconds(0);
    }
  }, [dataUpdatedAt]);

  // Select performance data based on range
  const perf = useMemo(() => {
    if (range === "day") return perfDaily;
    if (range === "week") return perfWeekly;
    return perfMonthly;
  }, [range, perfDaily, perfWeekly, perfMonthly]);

  // Filter and sort holdings
  const visibleHoldings: readonly HoldingRow[] = useMemo(() => {
    const q = holdingsQuery.trim().toLowerCase();
    const filtered = q
      ? holdings.filter(
          (h) =>
            h.name.toLowerCase().includes(q) ||
            h.ticker.toLowerCase().includes(q)
        )
      : holdings;

    const dir = sortDir === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return dir * compareStrings(a.name, b.name);
        case "date":
          return dir * compareStrings(a.date, b.date);
        case "status":
          return dir * compareStrings(a.status, b.status);
        case "volume":
          return dir * (a.volume - b.volume);
        case "changePct":
          return dir * (a.changePct - b.changePct);
        case "priceUsd":
          return dir * (a.priceUsd - b.priceUsd);
        case "pnlUsd":
          return dir * (a.pnlUsd - b.pnlUsd);
      }
    });

    return sorted;
  }, [holdings, holdingsQuery, sortDir, sortKey]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    // Ensure theme also applies to Portals (DropdownMenu/Modal) which render at document.body.
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    return () => {
      root.classList.remove("dark");
    };
  }, [theme]);

  const triggerSort = (key: SortKey) => {
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir("asc");
        return key;
      }
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return prev;
    });
  };

  return (
    <SidebarProvider defaultOpen>
      <div
        className={cn(
          // Fixed app shell: sidebar stays pinned; main content scrolls.
          "h-screen overflow-hidden",
          // In dark mode `--ui-surface` is intentionally translucent; use a solid base
          // so the page doesn't look "washed out" when the canvas/body behind is light.
          theme === "dark" ? "bg-(--ui-bg)" : "bg-(--ui-surface)",
          theme === "dark" && "dark"
        )}
      >
        {/* App shell */}
        <div className="mx-auto flex h-full w-full gap-6 p-6">
          <Sidebar
            collapsible="icon"
            width={260}
            className={cn("rounded-2xl overflow-hidden", "h-full")}
          >
            <SidebarHeader className="group-data-[state=collapsed]/sidebar:hidden">
              <Inline align="center" className="gap-3 px-1">
                <div className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
                  <Text as="div" className="truncate font-semibold text-white">
                    Orion Wealth
                  </Text>
                  <Text as="div" size="sm" className="text-white/70">
                    Wealth Management Platform
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
                        onClick={() => setActiveNav("Overview")}
                      >
                        <Home />
                        <span data-slot="label">Overview</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeNav === "Portfolio"}
                        onClick={() => setActiveNav("Portfolio")}
                      >
                        <Folder />
                        <span data-slot="label">Portfolio</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeNav === "Wallet"}
                        onClick={() => setActiveNav("Wallet")}
                      >
                        <Wallet />
                        <span data-slot="label">Wallet</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeNav === "Market"}
                        onClick={() => setActiveNav("Market")}
                      >
                        <ChartLine />
                        <span data-slot="label">Market</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeNav === "Community"}
                        onClick={() => setActiveNav("Community")}
                      >
                        <Users />
                        <span data-slot="label">Community</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeNav === "News"}
                        onClick={() => setActiveNav("News")}
                      >
                        <Newspaper />
                        <span data-slot="label">News</span>
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

          {/* Main content */}
          <main className="min-w-0 min-h-0 flex-1 overflow-y-auto">
            <Container className="max-w-none px-0">
              <Stack gap="lg">
                {/* App header */}
                <header
                  className={cn(
                    "rounded-2xl border border-(--ui-border) bg-(--ui-bg)",
                    "px-4 py-3 shadow-sm shadow-black/5"
                  )}
                >
                  <Inline align="center" justify="between" className="gap-3">
                    <SidebarTrigger ariaLabel="Toggle sidebar" />
                    <Inline
                      align="center"
                      className="w-full max-w-[420px] gap-2"
                    >
                      <div className="relative w-full">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--ui-text-muted)">
                          <Search />
                        </span>
                        <Input
                          aria-label="Search"
                          placeholder="Search..."
                          className="pl-9"
                        />
                      </div>
                    </Inline>

                    <Inline align="center" className="shrink-0 gap-2">
                      <IconButton
                        ariaLabel={`Switch to ${
                          theme === "dark" ? "light" : "dark"
                        } theme`}
                        variant="ghost"
                        size="md"
                        onClick={toggleTheme}
                        icon={theme === "dark" ? <Sun /> : <Moon />}
                      />
                      <div className="relative">
                        <IconButton
                          ariaLabel="Notifications"
                          variant="ghost"
                          size="md"
                          icon={<Bell />}
                        />
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full",
                            "bg-red-600 px-1 text-[10px] font-semibold text-white"
                          )}
                        >
                          3
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        className="h-auto rounded-2xl px-3 py-2"
                        aria-label="Open profile menu"
                        rightIcon={<ChevronDown />}
                        leftIcon={
                          <span
                            aria-hidden="true"
                            className="grid h-9 w-9 place-items-center rounded-2xl bg-(--ui-surface-2)"
                          >
                            <span className="text-sm font-semibold">BB</span>
                          </span>
                        }
                      >
                        <span className="hidden text-left sm:block">
                          <Text
                            as="div"
                            className="text-sm font-semibold leading-4"
                          >
                            Brock Balducci
                          </Text>
                        </span>
                      </Button>
                    </Inline>
                  </Inline>
                </header>

                {/* Welcome + top actions */}
                <DashboardHeader
                  userName="Brock"
                  portfolioValue={metrics.totalValue}
                  lastUpdated={lastUpdatedSeconds}
                  onAddAsset={() => undefined}
                />

                {/* Summary cards */}
                <section aria-label="Asset summary">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {assets.map((a) => (
                      <AssetSummaryCard key={a.id} asset={a} />
                    ))}
                  </div>
                </section>

                {/* Charts */}
                <section
                  aria-label="Charts"
                  className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                >
                  <PerformanceChart
                    data={perf}
                    range={range}
                    onRangeChange={setRange}
                  />
                  <AllocationChart
                    data={allocation}
                    totalInvested={metrics.totalCostBasis}
                  />
                </section>

                {/* Holdings */}
                <section aria-label="Holdings">
                  <Card>
                    <CardHeader className="pb-3">
                      <Inline
                        align="center"
                        justify="between"
                        className="w-full gap-3"
                      >
                        <div>
                          <Heading as="h3" className="text-base">
                            My Stocks
                          </Heading>
                          <Text as="div" size="sm" tone="muted">
                            Track positions, performance, and status.
                          </Text>
                        </div>

                        <div className="relative w-full max-w-[280px]">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--ui-text-muted)">
                            <Search />
                          </span>
                          <Input
                            aria-label="Search holdings"
                            placeholder="Search..."
                            value={holdingsQuery}
                            onChange={(e) =>
                              setHoldingsQuery(e.currentTarget.value)
                            }
                            className="pl-9"
                          />
                        </div>
                      </Inline>
                    </CardHeader>

                    <CardBody className="space-y-4">
                      {/* Desktop table */}
                      <div className="hidden md:block">
                        {visibleHoldings.length === 0 ? (
                          <EmptyHoldings onAddHolding={() => undefined} />
                        ) : (
                          <HoldingsTable
                            holdings={visibleHoldings}
                            onSort={triggerSort}
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onRemove={setConfirmRemoveId}
                          />
                        )}
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden">
                        {visibleHoldings.length === 0 ? (
                          <EmptyHoldings onAddHolding={() => undefined} />
                        ) : (
                          <div className="space-y-3">
                            {visibleHoldings.map((h) => (
                              <HoldingsMobileCard
                                key={h.id}
                                holding={h}
                                onRemove={setConfirmRemoveId}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </section>
              </Stack>
            </Container>
          </main>
        </div>

        {/* Confirm remove dialog */}
        <Modal
          open={confirmRemoveId !== null}
          onOpenChange={(open) => {
            if (!open) setConfirmRemoveId(null);
          }}
          title="Remove holding?"
          description="This will remove the position from your dashboard. You can add it again later."
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setConfirmRemoveId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirmRemoveId) {
                    dispatch(removeHolding(confirmRemoveId));
                  }
                  setConfirmRemoveId(null);
                }}
              >
                Remove
              </Button>
            </>
          }
        >
          <Text as="p" size="sm" tone="muted">
            Think of this like removing a sticky note from your desk: it doesn't
            change the company, it just clears your view.
          </Text>
        </Modal>
      </div>
    </SidebarProvider>
  );
}
