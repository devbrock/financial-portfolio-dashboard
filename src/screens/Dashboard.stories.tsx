import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Alert,
  AreaChart,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ChartContainer,
  Chip,
  Container,
  DeltaPill,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Heading,
  IconButton,
  Inline,
  Input,
  Modal,
  Skeleton,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Text,
  PieDonutChart,
} from "@components";
import {
  Bell,
  ChartLine,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  Folder,
  HelpCircle,
  Home,
  Moon,
  Newspaper,
  Plus,
  Search,
  Sun,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/utils/cn";

type DemoMode = "loaded" | "loading" | "error-empty";

type ThemeMode = "light" | "dark";

type AssetCardModel = {
  id: string;
  name: string;
  ticker: string;
  valueUsd: number;
  weeklyDeltaPct: number;
};

type PerformancePoint = {
  month: string;
  profitUsd: number;
};

type AllocationSlice = {
  name: "ETFs" | "Stocks" | "Bonds" | "Crypto";
  value: number;
  color: string;
};

type HoldingStatus = "active" | "pending";

type HoldingRow = {
  id: string;
  name: string;
  ticker: string;
  date: string;
  volume: number;
  changePct: number;
  purchasePrice: number;
  priceUsd: number;
  pnlUsd: number;
  status: HoldingStatus;
};

type SortKey =
  | "name"
  | "date"
  | "volume"
  | "changePct"
  | "purchasePrice"
  | "priceUsd"
  | "pnlUsd"
  | "status";

type SortDir = "asc" | "desc";

type DashboardDemoProps = {
  mode: DemoMode;
};

const meta: Meta<typeof DashboardDemo> = {
  title: "Screens/Financial Portfolio Dashboard",
  component: DashboardDemo,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj<typeof DashboardDemo>;

export const Default: Story = {
  args: { mode: "loaded" },
};

export const LoadingAndRefreshing: Story = {
  args: { mode: "loading" },
};

export const ErrorAndEmptyStates: Story = {
  args: { mode: "error-empty" },
};

/**
 * Join class names without `clsx` to keep this file self-contained.
 */
// function cn(...parts: Array<string | false | null | undefined>): string {
//   return parts.filter(Boolean).join(" ");
// }

function formatMoneyUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedPct(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function formatLastUpdated(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function AssetSummaryCard(props: { asset: AssetCardModel; loading?: boolean }) {
  const { asset, loading = false } = props;

  const deltaTone =
    asset.weeklyDeltaPct > 0
      ? ("success" as const)
      : asset.weeklyDeltaPct < 0
      ? ("danger" as const)
      : ("neutral" as const);

  const deltaDir =
    asset.weeklyDeltaPct > 0
      ? ("up" as const)
      : asset.weeklyDeltaPct < 0
      ? ("down" as const)
      : ("flat" as const);

  return (
    <Card
      elevation="sm"
      className={cn(
        "p-5",
        "transition-shadow duration-200 motion-reduce:transition-none",
        !loading && "hover:shadow-md hover:shadow-black/10"
      )}
    >
      <CardBody className="space-y-3">
        <Inline align="center" justify="between" className="gap-3">
          <Inline align="center" className="min-w-0 gap-3">
            <div
              className={cn(
                "grid h-10 w-10 place-items-center rounded-2xl",
                "border border-(--ui-border) bg-(--ui-surface)"
              )}
              aria-hidden="true"
            >
              <span className="text-sm font-semibold">
                {asset.name.slice(0, 1)}
              </span>
            </div>
            <div className="min-w-0">
              {loading ? (
                <div className="space-y-2" aria-hidden="true">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ) : (
                <>
                  <Text as="div" className="truncate font-semibold">
                    {asset.name}
                  </Text>
                  <Text as="div" size="sm" tone="muted" className="truncate">
                    {asset.ticker}
                  </Text>
                </>
              )}
            </div>
          </Inline>

          <DropdownMenu>
            <DropdownMenuTriggerIcon />
            <DropdownMenuContent
              className={cn(
                "animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
              )}
            >
              <DropdownMenuItem onClick={() => undefined}>
                View asset
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => undefined}>
                Add alert
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => undefined}>
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Inline>

        <Inline align="end" justify="between" className="gap-3">
          {loading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <Text as="div" className="text-2xl font-semibold">
              {formatMoneyUsd(asset.valueUsd)}
            </Text>
          )}

          {loading ? (
            <Skeleton className="h-6 w-24 rounded-full" />
          ) : (
            <Inline align="center" className="gap-2">
              <DeltaPill direction={deltaDir} tone={deltaTone}>
                {formatSignedPct(asset.weeklyDeltaPct)}
              </DeltaPill>
              <Text as="span" size="sm" tone="muted">
                Weekly
              </Text>
            </Inline>
          )}
        </Inline>
      </CardBody>
    </Card>
  );
}

function DropdownMenuTriggerIcon(props: { ariaLabel?: string }) {
  const { ariaLabel = "Open menu" } = props;
  return (
    <DropdownMenuTrigger asChild>
      <IconButton
        ariaLabel={ariaLabel}
        variant="ghost"
        size="sm"
        icon={<EllipsisVertical />}
      />
    </DropdownMenuTrigger>
  );
}

function ariasort(dir: SortDir | null): "ascending" | "descending" | "none" {
  if (!dir) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b, "en", { sensitivity: "base" });
}

function DashboardDemo(props: DashboardDemoProps) {
  const { mode } = props;

  const [theme, setTheme] = React.useState<ThemeMode>("light");
  const [range, setRange] = React.useState<"month" | "week" | "day">("month");
  const [holdingsQuery, setHoldingsQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [activeNav, setActiveNav] = React.useState<
    "Overview" | "Portfolio" | "Wallet" | "Market" | "Community" | "News"
  >("Overview");

  const [confirmRemoveId, setConfirmRemoveId] = React.useState<string | null>(
    null
  );
  const [recoveryOpen, setRecoveryOpen] = React.useState(
    mode === "error-empty"
  );

  const [lastUpdatedSeconds, setLastUpdatedSeconds] = React.useState(12);

  React.useEffect(() => {
    if (mode === "error-empty") return;
    const t = window.setInterval(() => {
      setLastUpdatedSeconds((s) => clampNumber(s + 1, 0, 999));
    }, 1000);
    return () => window.clearInterval(t);
  }, [mode]);

  const assets: readonly AssetCardModel[] = React.useMemo(
    () => [
      {
        id: "goog",
        name: "Google",
        ticker: "GOOG",
        valueUsd: 67859,
        weeklyDeltaPct: 8.2,
      },
      {
        id: "aapl",
        name: "Applagin",
        ticker: "AAPL",
        valueUsd: 85950,
        weeklyDeltaPct: -3.6,
      },
      {
        id: "spot",
        name: "Spotify",
        ticker: "SPOT",
        valueUsd: 48785,
        weeklyDeltaPct: 4.8,
      },
      {
        id: "dbx",
        name: "Dropbox",
        ticker: "DBX",
        valueUsd: 56749,
        weeklyDeltaPct: 8.9,
      },
    ],
    []
  );

  const perfDaily: readonly PerformancePoint[] = React.useMemo(
    () => [
      { month: "6am", profitUsd: 120 },
      { month: "9am", profitUsd: 280 },
      { month: "12pm", profitUsd: 450 },
      { month: "3pm", profitUsd: 520 },
      { month: "6pm", profitUsd: 680 },
    ],
    []
  );

  const perfWeekly: readonly PerformancePoint[] = React.useMemo(
    () => [
      { month: "Mon", profitUsd: 1200 },
      { month: "Tue", profitUsd: 2100 },
      { month: "Wed", profitUsd: 1800 },
      { month: "Thu", profitUsd: 2800 },
      { month: "Fri", profitUsd: 3200 },
      { month: "Sat", profitUsd: 2900 },
      { month: "Sun", profitUsd: 3400 },
    ],
    []
  );

  const perfMonthly: readonly PerformancePoint[] = React.useMemo(
    () => [
      { month: "Jan", profitUsd: 4000 },
      { month: "Feb", profitUsd: 8200 },
      { month: "Mar", profitUsd: 7500 },
      { month: "Apr", profitUsd: 12200 },
      { month: "May", profitUsd: 15100 },
      { month: "Jun", profitUsd: 18800 },
      { month: "Jul", profitUsd: 21000 },
      { month: "Aug", profitUsd: 34500 },
      { month: "Sep", profitUsd: 38500 },
    ],
    []
  );

  const perf = React.useMemo(() => {
    if (range === "day") return perfDaily;
    if (range === "week") return perfWeekly;
    return perfMonthly;
  }, [range, perfDaily, perfWeekly, perfMonthly]);

  const allocation: readonly AllocationSlice[] = React.useMemo(
    () => [
      { name: "ETFs", value: 48, color: "var(--ui-inverse-bg)" },
      { name: "Stocks", value: 28, color: "var(--ui-primary)" },
      { name: "Bonds", value: 20, color: "var(--ui-accent)" },
      {
        name: "Crypto",
        value: 16,
        color: "color-mix(in oklab, var(--ui-accent) 45%, white 55%)",
      },
    ],
    []
  );

  const holdings: readonly HoldingRow[] = React.useMemo(
    () => [
      {
        id: "h1",
        name: "Applagin",
        ticker: "AAPL",
        date: "22 June 2024",
        volume: 8.2e9,
        changePct: 4.1,
        purchasePrice: 84200,
        priceUsd: 87580,
        pnlUsd: 24.05,
        status: "active",
      },
      {
        id: "h2",
        name: "Spotify",
        ticker: "SPOT",
        date: "24 June 2024",
        volume: 9.16e9,
        changePct: -3.6,
        purchasePrice: 102300,
        priceUsd: 98478,
        pnlUsd: -32.05,
        status: "pending",
      },
      {
        id: "h3",
        name: "Dropbox",
        ticker: "DBX",
        date: "26 June 2024",
        volume: 3.06e9,
        changePct: 2.2,
        purchasePrice: 54300,
        priceUsd: 56749,
        pnlUsd: 18.7,
        status: "active",
      },
    ],
    []
  );

  const visibleHoldings: readonly HoldingRow[] = React.useMemo(() => {
    if (mode === "error-empty") return [];

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
        case "purchasePrice":
          return dir * (a.purchasePrice - b.purchasePrice);
        case "priceUsd":
          return dir * (a.priceUsd - b.priceUsd);
        case "pnlUsd":
          return dir * (a.pnlUsd - b.pnlUsd);
      }
    });

    return sorted;
  }, [holdings, holdingsQuery, mode, sortDir, sortKey]);

  const totalInvestedUsd = React.useMemo(() => {
    const base = 8847.04;
    return base;
  }, []);

  const totalPortfolioValueUsd = React.useMemo(() => {
    return assets.reduce((sum, asset) => sum + asset.valueUsd, 0);
  }, [assets]);

  const { totalProfitUsd, profitPercentage } = React.useMemo(() => {
    if (perf.length === 0) return { totalProfitUsd: 0, profitPercentage: 0 };

    const total = perf[perf.length - 1].profitUsd;
    const initial = perf[0].profitUsd;
    const change = total - initial;
    const percentage = initial !== 0 ? (change / initial) * 100 : 0;

    return { totalProfitUsd: total, profitPercentage: percentage };
  }, [perf]);

  const showLoading = mode === "loading";
  const showError = mode === "error-empty";

  const toggleTheme = React.useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  React.useEffect(() => {
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

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
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
                                <span className="text-sm font-semibold">
                                  BB
                                </span>
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
                        </DropdownMenuTrigger>

                        <DropdownMenuContent minWidth={240}>
                          <DropdownMenuItem onClick={() => undefined}>
                            Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => undefined}>
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => undefined}>
                            Sign out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Inline>
                  </Inline>
                </header>

                {/* Welcome + top actions */}
                <Inline align="center" justify="between" className="gap-3">
                  <div className="min-w-0">
                    <Heading as="h2" className="text-xl">
                      Welcome back, Brock!
                    </Heading>
                    <Text as="div" size="sm" tone="muted">
                      Here's a quick look at your portfolio health.
                    </Text>
                    {showLoading ? (
                      <Skeleton className="mt-2 h-8 w-48" />
                    ) : (
                      <>
                        <Text as="div" className="mt-2 text-2xl font-semibold">
                          {formatMoneyUsd(totalPortfolioValueUsd)}
                        </Text>
                        <Text as="div" size="sm" tone="muted" className="mt-1">
                          Last updated {formatLastUpdated(lastUpdatedSeconds)}
                        </Text>
                      </>
                    )}
                  </div>

                  <Inline align="center" className="shrink-0 gap-2">
                    <Button variant="primary" leftIcon={<Plus />}>
                      Add Asset
                    </Button>
                  </Inline>
                </Inline>

                {/* Rate limit banner (error story) */}
                {showError ? (
                  <Alert
                    tone="danger"
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <Text as="div" className="font-semibold">
                        You’re rate limited.
                      </Text>
                      <Text as="div" size="sm" tone="muted">
                        We couldn’t refresh holdings right now. Try again in a
                        moment.
                      </Text>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setLastUpdatedSeconds(0);
                      }}
                    >
                      Retry
                    </Button>
                  </Alert>
                ) : null}

                {/* Loading/refresh status row */}
                {mode === "loading" ? (
                  <Inline
                    align="center"
                    justify="between"
                    className="rounded-2xl border border-(--ui-border) bg-(--ui-bg) px-4 py-3"
                    aria-live="polite"
                  >
                    <Inline align="center" className="gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-2.5 w-2.5 rounded-full bg-(--ui-primary)",
                          "animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
                        )}
                      />
                      <Text as="div" size="sm">
                        Refreshing market prices…
                      </Text>
                    </Inline>
                    <Text as="div" size="sm" tone="muted">
                      Last updated {lastUpdatedSeconds}s ago
                    </Text>
                  </Inline>
                ) : null}

                {/* Summary cards */}
                <section
                  aria-label="Asset summary"
                  aria-busy={showLoading || undefined}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {assets.map((a) => (
                      <AssetSummaryCard
                        key={a.id}
                        asset={a}
                        loading={showLoading}
                      />
                    ))}
                  </div>
                </section>

                {/* Charts */}
                <section
                  aria-label="Charts"
                  className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                >
                  {/* Profit status */}
                  <ChartContainer
                    title="Profit status"
                    subtitle={
                      range === "day"
                        ? "Daily"
                        : range === "month"
                        ? "Monthly"
                        : "Weekly"
                    }
                    actions={
                      <Inline align="center" className="gap-2">
                        <Chip
                          selected={range === "day"}
                          onClick={() => setRange("day")}
                        >
                          Daily
                        </Chip>
                        <Chip
                          selected={range === "week"}
                          onClick={() => setRange("week")}
                        >
                          Weekly
                        </Chip>
                        <Chip
                          selected={range === "month"}
                          onClick={() => setRange("month")}
                        >
                          Monthly
                        </Chip>
                      </Inline>
                    }
                    aria-busy={showLoading || undefined}
                  >
                    {showLoading ? (
                      <div className="space-y-3" aria-hidden="true">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-[260px] w-full" />
                      </div>
                    ) : (
                      <>
                        <Inline
                          align="end"
                          justify="between"
                          className="mb-3 gap-3"
                        >
                          <div>
                            <Text as="div" className="text-2xl font-semibold">
                              {formatMoneyUsd(totalProfitUsd)}
                            </Text>
                            <Text as="div" size="sm" tone="muted">
                              Total profit
                            </Text>
                          </div>
                          <DeltaPill
                            direction={
                              profitPercentage > 0
                                ? "up"
                                : profitPercentage < 0
                                ? "down"
                                : "flat"
                            }
                            tone={
                              profitPercentage > 0
                                ? "success"
                                : profitPercentage < 0
                                ? "danger"
                                : "neutral"
                            }
                          >
                            {formatSignedPct(profitPercentage)}
                          </DeltaPill>
                        </Inline>
                        <AreaChart<PerformancePoint>
                          data={perf}
                          xKey="month"
                          series={[
                            {
                              key: "profitUsd",
                              name: "Profit",
                              color: "var(--ui-primary)",
                            },
                          ]}
                          yTickFormatter={(v) =>
                            typeof v === "number"
                              ? `$${formatCompact(v)}`
                              : String(v)
                          }
                        />
                      </>
                    )}
                  </ChartContainer>

                  {/* Diversification */}
                  <ChartContainer
                    title="Diversification"
                    subtitle="Current allocation"
                    aria-busy={showLoading || undefined}
                  >
                    {showLoading ? (
                      <div className="space-y-3" aria-hidden="true">
                        <Skeleton className="h-6 w-44" />
                        <Skeleton className="mx-auto h-[260px] w-full" />
                      </div>
                    ) : (
                      <div className="relative">
                        <PieDonutChart<AllocationSlice>
                          data={allocation}
                          nameKey="name"
                          valueKey="value"
                          variant="donut"
                          colors={allocation.map((s) => s.color)}
                          tooltipLabelFormatter={(l) => (
                            <span>{String(l)}</span>
                          )}
                          tooltipValueFormatter={(v) => (
                            <span>{String(v)}%</span>
                          )}
                        />

                        {/* Center label */}
                        <div
                          className={cn(
                            "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                            "text-center"
                          )}
                        >
                          <Text as="div" className="text-lg font-semibold">
                            {formatMoneyUsd(totalInvestedUsd)}
                          </Text>
                          <Text as="div" size="sm" tone="muted">
                            Invested in ETFs
                          </Text>
                        </div>
                      </div>
                    )}

                    {/* Legend */}
                    {!showLoading ? (
                      <Inline wrap gap="sm" className="mt-3">
                        {allocation.map((s) => (
                          <Inline key={s.name} align="center" className="gap-2">
                            <span
                              aria-hidden="true"
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: s.color }}
                            />
                            <Text as="span" size="sm" tone="muted">
                              {s.name}
                            </Text>
                          </Inline>
                        ))}
                      </Inline>
                    ) : null}
                  </ChartContainer>
                </section>

                {/* Holdings */}
                <section
                  aria-label="Holdings"
                  aria-busy={showLoading || undefined}
                >
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
                        {showLoading ? (
                          <div className="space-y-3" aria-hidden="true">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ) : visibleHoldings.length === 0 ? (
                          <EmptyHoldings
                            onRecover={() => setRecoveryOpen(true)}
                            showRecovery={showError}
                          />
                        ) : (
                          <Table>
                            <TableHead>
                              <TableRow>
                                <SortableTh
                                  label="Name Stock"
                                  active={sortKey === "name"}
                                  dir={sortKey === "name" ? sortDir : null}
                                  onClick={() => triggerSort("name")}
                                />
                                <SortableTh
                                  label="Date"
                                  active={sortKey === "date"}
                                  dir={sortKey === "date" ? sortDir : null}
                                  onClick={() => triggerSort("date")}
                                />
                                <SortableTh
                                  label="Volume"
                                  active={sortKey === "volume"}
                                  dir={sortKey === "volume" ? sortDir : null}
                                  onClick={() => triggerSort("volume")}
                                />
                                <SortableTh
                                  label="Change"
                                  active={sortKey === "changePct"}
                                  dir={sortKey === "changePct" ? sortDir : null}
                                  onClick={() => triggerSort("changePct")}
                                />
                                <SortableTh
                                  label="Price/stock"
                                  active={sortKey === "priceUsd"}
                                  dir={sortKey === "priceUsd" ? sortDir : null}
                                  onClick={() => triggerSort("priceUsd")}
                                />
                                <SortableTh
                                  label="Number of lost"
                                  active={sortKey === "pnlUsd"}
                                  dir={sortKey === "pnlUsd" ? sortDir : null}
                                  onClick={() => triggerSort("pnlUsd")}
                                />
                                <SortableTh
                                  label="Status"
                                  active={sortKey === "status"}
                                  dir={sortKey === "status" ? sortDir : null}
                                  onClick={() => triggerSort("status")}
                                />
                                <TableHeadCell className="w-12">
                                  <span className="sr-only">Actions</span>
                                </TableHeadCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {visibleHoldings.map((h) => (
                                <TableRow key={h.id} hover>
                                  <TableCell>
                                    <Inline align="center" className="gap-3">
                                      <span
                                        aria-hidden="true"
                                        className="grid h-9 w-9 place-items-center rounded-2xl bg-(--ui-surface-2)"
                                      >
                                        <span className="text-sm font-semibold">
                                          {h.name.slice(0, 1)}
                                        </span>
                                      </span>
                                      <div className="min-w-0">
                                        <Text
                                          as="div"
                                          className="truncate font-semibold"
                                        >
                                          {h.name}
                                        </Text>
                                        <Text as="div" size="sm" tone="muted">
                                          {h.ticker}
                                        </Text>
                                      </div>
                                    </Inline>
                                  </TableCell>
                                  <TableCell>{h.date}</TableCell>
                                  <TableCell>
                                    {formatCompact(h.volume)}
                                  </TableCell>
                                  <TableCell>
                                    <DeltaPill
                                      direction={
                                        h.changePct > 0
                                          ? "up"
                                          : h.changePct < 0
                                          ? "down"
                                          : "flat"
                                      }
                                      tone={
                                        h.changePct > 0
                                          ? "success"
                                          : h.changePct < 0
                                          ? "danger"
                                          : "neutral"
                                      }
                                    >
                                      {formatSignedPct(h.changePct)}
                                    </DeltaPill>
                                  </TableCell>
                                  <TableCell>
                                    {formatMoneyUsd(h.priceUsd)}
                                  </TableCell>
                                  <TableCell>
                                    <Text
                                      as="span"
                                      className={cn(
                                        "font-semibold",
                                        h.pnlUsd >= 0
                                          ? "text-emerald-700"
                                          : "text-red-700"
                                      )}
                                    >
                                      {h.pnlUsd >= 0 ? "+" : ""}
                                      {formatMoneyUsd(h.pnlUsd)}
                                    </Text>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      tone={
                                        h.status === "active"
                                          ? "success"
                                          : "warning"
                                      }
                                    >
                                      {h.status === "active"
                                        ? "Active"
                                        : "Pending"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTriggerIcon
                                        ariaLabel={`Row actions for ${h.ticker}`}
                                      />
                                      <DropdownMenuContent
                                        className={cn(
                                          "animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
                                        )}
                                      >
                                        <DropdownMenuItem
                                          onClick={() => undefined}
                                        >
                                          View details
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setConfirmRemoveId(h.id)
                                          }
                                        >
                                          Remove…
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden">
                        {showLoading ? (
                          <div className="space-y-3" aria-hidden="true">
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                          </div>
                        ) : visibleHoldings.length === 0 ? (
                          <EmptyHoldings
                            onRecover={() => setRecoveryOpen(true)}
                            showRecovery={showError}
                          />
                        ) : (
                          <div className="space-y-3">
                            {visibleHoldings.map((h) => (
                              <Card key={h.id} className="p-4">
                                <CardBody className="space-y-3">
                                  <Inline
                                    align="center"
                                    justify="between"
                                    className="gap-3"
                                  >
                                    <Inline align="center" className="gap-3">
                                      <span
                                        aria-hidden="true"
                                        className="grid h-10 w-10 place-items-center rounded-2xl bg-(--ui-surface-2)"
                                      >
                                        <span className="text-sm font-semibold">
                                          {h.name.slice(0, 1)}
                                        </span>
                                      </span>
                                      <div className="min-w-0">
                                        <Text
                                          as="div"
                                          className="truncate font-semibold"
                                        >
                                          {h.name}
                                        </Text>
                                        <Text as="div" size="sm" tone="muted">
                                          {h.ticker} • {h.date}
                                        </Text>
                                      </div>
                                    </Inline>

                                    <DropdownMenu>
                                      <DropdownMenuTriggerIcon
                                        ariaLabel={`Row actions for ${h.ticker}`}
                                      />
                                      <DropdownMenuContent
                                        className={cn(
                                          "animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
                                        )}
                                      >
                                        <DropdownMenuItem
                                          onClick={() => undefined}
                                        >
                                          View details
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setConfirmRemoveId(h.id)
                                          }
                                        >
                                          Remove…
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </Inline>

                                  <Inline wrap gap="sm" className="gap-2">
                                    <Badge
                                      tone={
                                        h.status === "active"
                                          ? "success"
                                          : "warning"
                                      }
                                    >
                                      {h.status === "active"
                                        ? "Active"
                                        : "Pending"}
                                    </Badge>
                                    <DeltaPill
                                      direction={
                                        h.changePct > 0
                                          ? "up"
                                          : h.changePct < 0
                                          ? "down"
                                          : "flat"
                                      }
                                      tone={
                                        h.changePct > 0
                                          ? "success"
                                          : h.changePct < 0
                                          ? "danger"
                                          : "neutral"
                                      }
                                    >
                                      {formatSignedPct(h.changePct)}
                                    </DeltaPill>
                                  </Inline>

                                  <Inline
                                    align="center"
                                    justify="between"
                                    className="gap-3"
                                  >
                                    <Text as="div" size="sm" tone="muted">
                                      Price
                                    </Text>
                                    <Text as="div" className="font-semibold">
                                      {formatMoneyUsd(h.priceUsd)}
                                    </Text>
                                  </Inline>
                                  <Inline
                                    align="center"
                                    justify="between"
                                    className="gap-3"
                                  >
                                    <Text as="div" size="sm" tone="muted">
                                      P/L
                                    </Text>
                                    <Text
                                      as="div"
                                      className={cn(
                                        "font-semibold",
                                        h.pnlUsd >= 0
                                          ? "text-emerald-700"
                                          : "text-red-700"
                                      )}
                                    >
                                      {h.pnlUsd >= 0 ? "+" : ""}
                                      {formatMoneyUsd(h.pnlUsd)}
                                    </Text>
                                  </Inline>
                                </CardBody>
                              </Card>
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
                  setConfirmRemoveId(null);
                }}
              >
                Remove
              </Button>
            </>
          }
        >
          <Text as="p" size="sm" tone="muted">
            Think of this like removing a sticky note from your desk: it doesn’t
            change the company, it just clears your view.
          </Text>
        </Modal>

        {/* Corrupted storage recovery dialog (optional) */}
        <Modal
          open={recoveryOpen}
          onOpenChange={setRecoveryOpen}
          title="Recover dashboard data"
          description="We detected corrupted local storage. Resetting will restore defaults for this demo."
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setRecoveryOpen(false)}
              >
                Not now
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setHoldingsQuery("");
                  setSortKey("name");
                  setSortDir("asc");
                  setRecoveryOpen(false);
                }}
              >
                Reset
              </Button>
            </>
          }
        >
          <Text as="p" size="sm" tone="muted">
            We’ll clear only the demo’s saved state and reload the default mock
            portfolio.
          </Text>
        </Modal>
      </div>
    </SidebarProvider>
  );
}

function SortableTh(props: {
  label: string;
  active: boolean;
  dir: SortDir | null;
  onClick: () => void;
}) {
  const { label, active, dir, onClick } = props;
  return (
    <TableHeadCell aria-sort={ariasort(dir)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-2",
          "rounded-lg px-2 py-1",
          "hover:bg-(--ui-surface)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ui-bg)"
        )}
      >
        <span>{label}</span>
        <span
          aria-hidden="true"
          className={cn("inline-flex", !active && "opacity-40")}
        >
          <ChevronUp />
        </span>
      </button>
    </TableHeadCell>
  );
}

function EmptyHoldings(props: {
  onRecover: () => void;
  showRecovery: boolean;
}) {
  const { onRecover, showRecovery } = props;
  return (
    <div className="rounded-2xl border border-(--ui-border) bg-(--ui-surface) p-6">
      <Stack gap="md">
        <div>
          <Text as="div" className="font-semibold">
            No holdings found
          </Text>
          <Text as="div" size="sm" tone="muted">
            Adjust your search, or add positions to start tracking performance.
          </Text>
        </div>
        {showRecovery ? (
          <Inline align="center" className="gap-2">
            <Button variant="secondary" onClick={onRecover}>
              Recover demo data
            </Button>
            <Text as="span" size="sm" tone="muted">
              (simulates corrupted storage recovery)
            </Text>
          </Inline>
        ) : (
          <Button variant="primary" onClick={() => undefined}>
            Add holding
          </Button>
        )}
      </Stack>
    </div>
  );
}
