import { useMemo, useEffect, useState, useCallback } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Combobox,
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
  ChartLine,
  ChevronDown,
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
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/utils/cn";
import type { ComboboxItem } from "@components";
import type { SortKey, SortDir, HoldingRow } from "@/types/dashboard";
import { clampNumber } from "@utils/clampNumber";
import { compareStrings } from "@utils/compareStrings";
import { useDashboardData } from "./hooks/useDashboardData";
import { useSymbolSearch } from "@/hooks/useSymbolSearch";
import { useCryptoSearch } from "@/hooks/useCryptoSearch";
import {
  AssetSummaryCard,
  DashboardHeader,
  PerformanceChart,
  AllocationChart,
  HoldingsTable,
  HoldingsMobileCard,
  EmptyHoldings,
} from "./components";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addHolding,
  removeHolding,
  updatePreferences,
} from "@/features/portfolio/portfolioSlice";
import type { AssetType } from "@/types/portfolio";
import OrionLogoLight from "@assets/orion_logo_light.svg";

const addAssetSchema = z.object({
  assetSelection: z.string().min(1, "Select an asset from search"),
  assetType: z.enum(["stock", "crypto"]),
  symbol: z.string().min(1, "Select an asset from search"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  purchasePrice: z.number().positive("Purchase price must be greater than 0"),
  purchaseDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Purchase date is required",
  }),
});

type AddAssetFormValues = z.infer<typeof addAssetSchema>;

function generateHoldingId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function Dashboard() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.portfolio.preferences.theme);
  const [range, setRange] = useState<"month" | "week" | "day">("month");
  const [holdingsQuery, setHoldingsQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [activeNav, setActiveNav] = useState<
    "Overview" | "Portfolio" | "Wallet" | "Market" | "Community" | "News"
  >("Overview");
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState(12);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [assetQuery, setAssetQuery] = useState("");
  const [selectedAssetLabel, setSelectedAssetLabel] = useState("");
  const handleAddAsset = useCallback(() => setIsAddAssetOpen(true), []);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    control,
  } = useForm<AddAssetFormValues>({
    resolver: zodResolver(addAssetSchema),
    defaultValues: {
      assetSelection: "",
      assetType: "stock",
      symbol: "",
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: today,
    },
  });

  const selectedAssetValue = useWatch({
    control,
    name: "assetSelection",
  });

  const handleAssetQueryChange = useCallback(
    (nextQuery: string) => {
      if (selectedAssetLabel && nextQuery === selectedAssetLabel) return;
      const trimmed = nextQuery.trim();
      setAssetQuery(trimmed.length >= 2 ? trimmed : "");
    },
    [selectedAssetLabel]
  );

  const { data: stockSearch, isFetching: isStockSearchLoading } =
    useSymbolSearch(assetQuery);
  const { data: cryptoSearch, isFetching: isCryptoSearchLoading } =
    useCryptoSearch(assetQuery);

  const assetOptions: ComboboxItem[] = useMemo(() => {
    const stockItems = (stockSearch?.result ?? [])
      .filter((result) => result.symbol)
      .slice(0, 6)
      .map((result) => ({
        value: `stock:${result.symbol.toUpperCase()}`,
        label: `Stock · ${result.displaySymbol} — ${result.description}`,
      }));
    const cryptoItems = (cryptoSearch?.coins ?? []).slice(0, 6).map((coin) => ({
      value: `crypto:${coin.id.toLowerCase()}`,
      label: `Crypto · ${coin.symbol.toUpperCase()} — ${coin.name}`,
    }));
    const merged = [...stockItems, ...cryptoItems];
    if (
      selectedAssetValue &&
      selectedAssetLabel &&
      !merged.some((item) => item.value === selectedAssetValue)
    ) {
      return [
        { value: selectedAssetValue, label: selectedAssetLabel },
        ...merged,
      ];
    }
    return merged;
  }, [
    stockSearch,
    cryptoSearch,
    selectedAssetLabel,
    selectedAssetValue,
  ]);

  const isAssetSearchLoading = isStockSearchLoading || isCryptoSearchLoading;

  const onSubmitAddAsset = useCallback(
    (values: AddAssetFormValues) => {
      const assetType = values.assetType as AssetType;
      const normalizedSymbol =
        assetType === "stock"
          ? values.symbol.trim().toUpperCase()
          : values.symbol.trim().toLowerCase();

      dispatch(
        addHolding({
          id: generateHoldingId(),
          symbol: normalizedSymbol,
          assetType,
          quantity: values.quantity,
          purchasePrice: values.purchasePrice,
          purchaseDate: values.purchaseDate,
        })
      );
      reset({
        assetSelection: "",
        assetType: values.assetType,
        symbol: "",
        quantity: 0,
        purchasePrice: 0,
        purchaseDate: today,
      });
      setIsAddAssetOpen(false);
    },
    [dispatch, reset, today]
  );

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
    dispatch(
      updatePreferences({ theme: theme === "dark" ? "light" : "dark" })
    );
  }, [dispatch, theme]);

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
                  <img
                    src={OrionLogoLight}
                    alt="Orion"
                    className="h-7 w-auto"
                  />
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

        {/* Add asset dialog */}
        <Modal
          open={isAddAssetOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddAssetOpen(false);
              setAssetQuery("");
              setSelectedAssetLabel("");
              reset({
                assetSelection: "",
                assetType: "stock",
                symbol: "",
                quantity: 0,
                purchasePrice: 0,
                purchaseDate: today,
              });
            }
          }}
          title="Add asset"
          description="Record a new position to update your portfolio totals."
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setIsAddAssetOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                form="add-asset-form"
                disabled={isSubmitting}
              >
                Add Asset
              </Button>
            </>
          }
        >
          <form
            id="add-asset-form"
            onSubmit={handleSubmit(onSubmitAddAsset)}
            className="space-y-3"
          >
            <div>
              <Text as="label" htmlFor="assetSearch" size="sm">
                Search asset
              </Text>
              <Controller
                control={control}
                name="assetSelection"
                render={({ field }) => (
                  <Combobox
                    id="assetSearch"
                    placeholder="Search RBLX, Adobe, BTC, Ethereum..."
                    items={assetOptions}
                    value={field.value}
                    onValueChange={(nextValue) => {
                      field.onChange(nextValue);
                      const selectedItem = assetOptions.find(
                        (item) => item.value === nextValue
                      );
                      setSelectedAssetLabel(selectedItem?.label ?? "");
                      const isStock = nextValue.startsWith("stock:");
                      const rawSymbol = nextValue.replace(
                        isStock ? "stock:" : "crypto:",
                        ""
                      );
                      setValue("assetType", isStock ? "stock" : "crypto", {
                        shouldValidate: true,
                      });
                      setValue(
                        "symbol",
                        isStock
                          ? rawSymbol.toUpperCase()
                          : rawSymbol.toLowerCase(),
                        { shouldValidate: true }
                      );
                    }}
                    onInputChange={() => {
                      if (field.value) {
                        field.onChange("");
                        setSelectedAssetLabel("");
                        setValue("assetType", "stock", {
                          shouldValidate: true,
                        });
                        setValue("symbol", "", { shouldValidate: true });
                      }
                    }}
                    onQueryChange={handleAssetQueryChange}
                    loading={isAssetSearchLoading}
                    minChars={2}
                    inputClassName="mt-1"
                  />
                )}
              />
              <Text as="div" size="sm" tone="muted" className="mt-1">
                Results include stocks and crypto. Pick one to continue.
              </Text>
              {errors.assetSelection ? (
                <Text as="div" size="sm" className="mt-1 text-red-600">
                  {errors.assetSelection.message}
                </Text>
              ) : null}
            </div>

            <input type="hidden" {...register("assetType")} />
            <input type="hidden" {...register("symbol")} />

            <Inline align="start" className="gap-3">
              <div className="w-full">
                <Text as="label" htmlFor="quantity" size="sm">
                  Quantity
                </Text>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  className="mt-1"
                  {...register("quantity", { valueAsNumber: true })}
                />
                {errors.quantity ? (
                  <Text as="div" size="sm" className="mt-1 text-red-600">
                    {errors.quantity.message}
                  </Text>
                ) : null}
              </div>
              <div className="w-full">
                <Text as="label" htmlFor="purchasePrice" size="sm">
                  Purchase price (USD)
                </Text>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="any"
                  className="mt-1"
                  {...register("purchasePrice", { valueAsNumber: true })}
                />
                {errors.purchasePrice ? (
                  <Text as="div" size="sm" className="mt-1 text-red-600">
                    {errors.purchasePrice.message}
                  </Text>
                ) : null}
              </div>
            </Inline>

            <div>
              <Text as="label" htmlFor="purchaseDate" size="sm">
                Purchase date
              </Text>
              <Input
                id="purchaseDate"
                type="date"
                className="mt-1"
                {...register("purchaseDate")}
              />
              {errors.purchaseDate ? (
                <Text as="div" size="sm" className="mt-1 text-red-600">
                  {errors.purchaseDate.message}
                </Text>
              ) : null}
            </div>
          </form>
        </Modal>
      </div>
    </SidebarProvider>
  );
}
