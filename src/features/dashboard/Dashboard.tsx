import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Heading,
  IconButton,
  Inline,
  Input,
  Modal,
  SidebarProvider,
  SidebarTrigger,
  Stack,
  Text,
} from "@components";
import { ChevronDown, Moon, Plus, Search, Sun } from "lucide-react";
import { cn } from "@/utils/cn";
import type { SortKey, SortDir, HoldingRow } from "@/types/dashboard";
import { clampNumber } from "@utils/clampNumber";
import { compareStrings } from "@utils/compareStrings";
import { toast } from "sonner";
import { useDashboardData } from "./hooks/useDashboardData";
import {
  AddAssetModal,
  AssetSummaryCard,
  DashboardHeader,
  DashboardSidebar,
  PerformanceChart,
  AllocationChart,
  HoldingsTable,
  HoldingsMobileCard,
  EmptyHoldings,
} from "./components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  removeHolding,
  updatePreferences,
} from "@/features/portfolio/portfolioSlice";
import type { DashboardNav } from "./components/DashboardSidebar";

export function Dashboard() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.portfolio.preferences.theme);
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [holdingsQuery, setHoldingsQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [activeNav, setActiveNav] = useState<DashboardNav>("Overview");
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState(12);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [flashPrices, setFlashPrices] = useState(false);
  const handleAddAsset = useCallback(() => setIsAddAssetOpen(true), []);
  const handleLogout = useCallback(() => undefined, []);
  const dataUpdatedAtRef = useRef(0);
  const lastResetRef = useRef(0);

  // Get dashboard data
  const {
    assets,
    perf7d,
    perf30d,
    perf90d,
    perf1y,
    allocation,
    holdings,
    metrics,
    dailyPlPct,
    isLoading,
    isError,
    errorMessage,
    dataUpdatedAt,
  } = useDashboardData();
  const [liveMessage, setLiveMessage] = useState("");
  const [errorAnnounce, setErrorAnnounce] = useState("");
  const lastToastErrorRef = useRef<string | null>(null);

  // Update "last updated" timer
  useEffect(() => {
    const t = window.setInterval(() => {
      setLastUpdatedSeconds((s) => {
        if (dataUpdatedAtRef.current !== lastResetRef.current) {
          lastResetRef.current = dataUpdatedAtRef.current;
          return 0;
        }
        return clampNumber(s + 1, 0, 999);
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    dataUpdatedAtRef.current = dataUpdatedAt;
    if (dataUpdatedAt > 0) {
      setFlashPrices(true);
      setLiveMessage("Prices updated.");
      const handle = window.setTimeout(() => setFlashPrices(false), 1200);
      return () => window.clearTimeout(handle);
    }
  }, [dataUpdatedAt]);

  useEffect(() => {
    if (isLoading) {
      setLiveMessage("Loading portfolio data.");
      return;
    }
    setLiveMessage("Portfolio data loaded.");
  }, [isLoading]);

  useEffect(() => {
    if (isError) {
      setErrorAnnounce(errorMessage || "Market data unavailable.");
      if (errorMessage && lastToastErrorRef.current !== errorMessage) {
        toast.error(errorMessage);
        lastToastErrorRef.current = errorMessage;
      }
    } else {
      setErrorAnnounce("");
      lastToastErrorRef.current = null;
    }
  }, [errorMessage, isError]);

  // Select performance data based on range
  const perf = useMemo(() => {
    if (range === "7d") return perf7d;
    if (range === "90d") return perf90d;
    if (range === "1y") return perf1y;
    return perf30d;
  }, [range, perf7d, perf30d, perf90d, perf1y]);

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
    dispatch(updatePreferences({ theme: theme === "dark" ? "light" : "dark" }));
  }, [dispatch, theme]);

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded-xl focus:bg-(--ui-bg) focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
        >
          Skip to main content
        </a>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {liveMessage}
        </div>
        <div aria-live="assertive" aria-atomic="true" className="sr-only">
          {errorAnnounce}
        </div>
        {/* App shell */}
        <div className="mx-auto flex h-full min-h-0 w-full gap-6 p-6">
          <DashboardSidebar activeNav={activeNav} onNavChange={setActiveNav} />

          {/* Main content */}
          <main
            id="main-content"
            className="min-w-0 min-h-0 flex-1 overflow-y-auto"
          >
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
                        <DropdownMenuContent
                          className={cn(
                            "animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
                          )}
                        >
                          <DropdownMenuItem onClick={handleLogout}>
                            Logout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Inline>
                  </Inline>
                </header>

                {isError ? (
                  <Card className="border-amber-200 bg-amber-50/60">
                    <CardBody>
                      <Inline
                        align="center"
                        justify="between"
                        className="gap-4"
                      >
                        <div className="min-w-0">
                          <Text
                            as="div"
                            className="font-semibold text-amber-900"
                          >
                            Market data is temporarily unavailable.
                          </Text>
                          <Text as="div" size="sm" className="text-amber-800">
                            {errorMessage}
                          </Text>
                        </div>
                        <Button
                          variant="secondary"
                          className="shrink-0"
                          onClick={handleRetry}
                        >
                          Retry
                        </Button>
                      </Inline>
                    </CardBody>
                  </Card>
                ) : null}

                {/* Welcome + top actions */}
                <DashboardHeader
                  userName="Brock"
                  portfolioValue={metrics.totalValue}
                  lastUpdated={lastUpdatedSeconds}
                  dailyChangePct={dailyPlPct}
                />

                {/* Summary cards */}
                <section aria-label="Asset summary">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {assets.map((a) => (
                      <AssetSummaryCard
                        key={a.id}
                        asset={a}
                        flash={flashPrices}
                      />
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
                    isSimulated
                    flash={flashPrices}
                  />
                  <AllocationChart
                    data={allocation}
                    totalInvested={metrics.totalCostBasis}
                    flash={flashPrices}
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
                        <div className="min-w-0 flex-1">
                          <Heading as="h3" className="text-base">
                            My Holdings
                          </Heading>
                          <Text as="div" size="sm" tone="muted">
                            Track positions, performance, and status.
                          </Text>
                        </div>

                        <div className="flex w-full flex-1 justify-center">
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
                        </div>

                        <div className="flex flex-1 justify-end">
                          <Button
                            variant="primary"
                            leftIcon={<Plus />}
                            onClick={handleAddAsset}
                          >
                            Add Asset
                          </Button>
                        </div>
                      </Inline>
                    </CardHeader>

                    <CardBody className="space-y-4">
                      {/* Desktop table */}
                      <div className="hidden md:block">
                        {visibleHoldings.length === 0 ? (
                          <EmptyHoldings onAddHolding={handleAddAsset} />
                        ) : (
                          <HoldingsTable
                            holdings={visibleHoldings}
                            onSort={triggerSort}
                            sortKey={sortKey}
                            sortDir={sortDir}
                            onRemove={setConfirmRemoveId}
                            flash={flashPrices}
                          />
                        )}
                      </div>

                      {/* Mobile cards */}
                      <div className="md:hidden">
                        {visibleHoldings.length === 0 ? (
                          <EmptyHoldings onAddHolding={handleAddAsset} />
                        ) : (
                          <div className="space-y-3">
                            {visibleHoldings.map((h) => (
                              <HoldingsMobileCard
                                key={h.id}
                                holding={h}
                                onRemove={setConfirmRemoveId}
                                flash={flashPrices}
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
                    toast.success("Asset removed from your portfolio.");
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

        <AddAssetModal open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen} />
      </div>
    </SidebarProvider>
  );
}
