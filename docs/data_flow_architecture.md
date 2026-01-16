# Data Flow Architecture

## Overview

This application follows the Redux Toolkit + React Query pattern:
- **Redux (Client State)**: Portfolio holdings, transactions, user preferences
- **React Query (Server State)**: Market prices, historical data, company profiles

## State Separation

### Redux - Client State (Persisted)

**Portfolio Holdings:**
```typescript
{
  id: string;
  symbol: string; // "AAPL", "BTC", etc.
  assetType: "stock" | "crypto";
  quantity: number;
  purchasePrice: number; // USD per unit
  purchaseDate: string; // ISO date
  notes?: string;
}
```

**User Preferences:**
```typescript
{
  theme: "light" | "dark";
  currency: "USD"; // Future: EUR, GBP, etc.
  chartRange: "7d" | "30d" | "90d" | "1y";
  sortPreference: { key: string; direction: "asc" | "desc" };
}
```

**User Seed:**
```typescript
{
  seed: string; // Unique identifier for deterministic mock data
  initialized: boolean;
}
```

### React Query - Server State (Not Persisted)

**Current Prices (Auto-refresh every 60s):**
- Stock quotes (Finnhub `/quote`)
- Crypto prices (CoinGecko `/simple/price`)

**Historical Data (Cached indefinitely):**
- Stock historical (Alpha Vantage `TIME_SERIES_DAILY`)
- Crypto historical (CoinGecko `/coins/{id}/market_chart`)

**Company Data (Cached 24h):**
- Company profiles (Finnhub `/stock/profile2`)

## Data Flow

### 1. Initial Load (First-Time User)

```
App Start
  ↓
Redux Persist Rehydration
  ↓
Check if holdings exist
  ↓ (NO)
Generate Unique Seed
  ↓
Generate Mock Holdings (5-10 assets)
  - Random stocks (AAPL, MSFT, GOOGL, TSLA, etc.)
  - Random crypto (BTC, ETH, etc.)
  - Random quantities and purchase dates
  - Realistic purchase prices (historical data)
  ↓
Dispatch to Redux
  ↓
Save to localStorage via Redux Persist
```

### 2. Subsequent Loads (Returning User)

```
App Start
  ↓
Redux Persist Rehydration
  ↓
Holdings loaded from localStorage
  ↓
Continue to Dashboard Load
```

### 3. Dashboard Load

```
Holdings from Redux
  ↓
Extract symbols by type
  - stocks: ["AAPL", "MSFT", ...]
  - crypto: ["bitcoin", "ethereum", ...]
  ↓
Parallel React Query Requests:
  ├─ Fetch stock quotes (Finnhub)
  ├─ Fetch crypto prices (CoinGecko)
  ├─ Fetch company profiles (Finnhub)
  └─ Fetch historical data (Alpha Vantage + CoinGecko)
  ↓
Combine Redux + React Query Data
  ↓
Calculate Metrics:
  - Total portfolio value
  - Daily P/L ($ and %)
  - Asset allocation (stocks % vs crypto %)
  - Individual holding P/L
  ↓
Render Dashboard
```

### 4. Add Asset Flow

```
User fills form
  ↓
Validate with Zod
  ↓
Optimistic Update (Redux)
  ↓
React Query auto-fetches new symbol
  ↓
Recalculate portfolio metrics
  ↓
Update UI
  ↓
Redux Persist saves to localStorage
```

### 5. Remove Asset Flow

```
User clicks remove
  ↓
Confirmation dialog
  ↓ (Confirm)
Dispatch remove action (Redux)
  ↓
React Query stops fetching removed symbol
  ↓
Recalculate portfolio metrics
  ↓
Update UI
  ↓
Redux Persist saves to localStorage
```

## Unique Data Generation Strategy

### Seed Generation

```typescript
// Generate unique seed on first visit
const generateSeed = (): string => {
  // Combine browser fingerprint + timestamp for uniqueness
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join('|');

  // Hash to create deterministic seed
  return btoa(fingerprint + Date.now()).slice(0, 16);
};
```

### Seeded Random Number Generator

```typescript
// Deterministic random based on seed
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashCode(seed);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}
```

### Mock Holdings Generation

```typescript
const generateMockHoldings = (seed: string): Holding[] => {
  const rng = new SeededRandom(seed);

  const stockPool = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"];
  const cryptoPool = ["bitcoin", "ethereum", "cardano", "solana"];

  const numStocks = rng.nextInt(3, 5);
  const numCrypto = rng.nextInt(1, 3);

  const holdings: Holding[] = [];

  // Generate stock holdings
  for (let i = 0; i < numStocks; i++) {
    const symbol = rng.pick(stockPool);
    stockPool.splice(stockPool.indexOf(symbol), 1); // No duplicates

    holdings.push({
      id: generateId(),
      symbol,
      assetType: "stock",
      quantity: rng.nextInt(1, 100),
      purchasePrice: rng.nextInt(50, 500), // Simplified
      purchaseDate: generateRandomDate(rng, 365), // Within last year
    });
  }

  // Generate crypto holdings
  for (let i = 0; i < numCrypto; i++) {
    const symbol = rng.pick(cryptoPool);
    cryptoPool.splice(cryptoPool.indexOf(symbol), 1);

    holdings.push({
      id: generateId(),
      symbol,
      assetType: "crypto",
      quantity: rng.next() * 10, // 0-10 coins
      purchasePrice: rng.nextInt(100, 50000), // Varies widely
      purchaseDate: generateRandomDate(rng, 365),
    });
  }

  return holdings;
};
```

## Portfolio Calculations

### Total Value

```typescript
const calculateTotalValue = (
  holdings: Holding[],
  stockPrices: Map<string, number>,
  cryptoPrices: Map<string, number>
): number => {
  return holdings.reduce((total, holding) => {
    const currentPrice = holding.assetType === "stock"
      ? stockPrices.get(holding.symbol) ?? 0
      : cryptoPrices.get(holding.symbol) ?? 0;

    return total + (holding.quantity * currentPrice);
  }, 0);
};
```

### Individual P/L

```typescript
const calculatePL = (
  holding: Holding,
  currentPrice: number
): { plUsd: number; plPct: number } => {
  const costBasis = holding.quantity * holding.purchasePrice;
  const currentValue = holding.quantity * currentPrice;
  const plUsd = currentValue - costBasis;
  const plPct = (plUsd / costBasis) * 100;

  return { plUsd, plPct };
};
```

### Asset Allocation

```typescript
const calculateAllocation = (
  holdings: Holding[],
  stockPrices: Map<string, number>,
  cryptoPrices: Map<string, number>
): { stocks: number; crypto: number } => {
  let stockValue = 0;
  let cryptoValue = 0;

  holdings.forEach(holding => {
    const currentPrice = holding.assetType === "stock"
      ? stockPrices.get(holding.symbol) ?? 0
      : cryptoPrices.get(holding.symbol) ?? 0;

    const value = holding.quantity * currentPrice;

    if (holding.assetType === "stock") {
      stockValue += value;
    } else {
      cryptoValue += value;
    }
  });

  const total = stockValue + cryptoValue;

  return {
    stocks: (stockValue / total) * 100,
    crypto: (cryptoValue / total) * 100,
  };
};
```

## React Query Configuration

### Cache Strategy

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // Default: 60 seconds
      gcTime: 300000, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});
```

### Per-Endpoint Overrides

- **Stock quotes**: staleTime: 50s, refetchInterval: 60s
- **Crypto prices**: staleTime: 50s, refetchInterval: 60s
- **Historical data**: staleTime: Infinity (never refetch)
- **Company profiles**: staleTime: 24h

## Custom Hooks Architecture

### Low-Level Hooks (Already Created)

- `useStockQuote(symbol)` - Finnhub quote
- `useCompanyProfile(symbol)` - Finnhub profile
- `useSymbolSearch(query)` - Finnhub search
- `useStockHistoricalData(symbol)` - Alpha Vantage historical
- `useCryptoPrice(params)` - CoinGecko price
- `useCryptoHistoricalData(coinId, params)` - CoinGecko historical

### Mid-Level Hooks (To Create)

- `usePortfolioHoldings()` - Redux selector
- `useStockPrices(symbols[])` - Batch stock quotes
- `useCryptoPrices(coinIds[])` - Batch crypto prices
- `usePortfolioValue()` - Total value calculation
- `useAssetAllocation()` - Allocation calculation

### High-Level Hook (To Create)

- `useDashboardData()` - Orchestrates all data needs for dashboard

## File Structure

```
src/
├── features/
│   └── portfolio/
│       ├── portfolioSlice.ts          # Redux slice
│       ├── hooks/
│       │   ├── usePortfolioHoldings.ts
│       │   ├── useStockPrices.ts
│       │   ├── useCryptoPrices.ts
│       │   ├── usePortfolioValue.ts
│       │   └── useAssetAllocation.ts
│       └── utils/
│           ├── generateSeed.ts
│           ├── SeededRandom.ts
│           ├── generateMockHoldings.ts
│           └── calculations.ts
├── store/
│   ├── store.ts                       # Redux store config
│   └── persistConfig.ts               # Redux Persist config
└── types/
    └── portfolio.ts                   # Portfolio types
```

## Implementation Order

1. Create portfolio types
2. Create SeededRandom utility
3. Create generateSeed utility
4. Create generateMockHoldings utility
5. Create calculation utilities
6. Create Redux slice with initial state logic
7. Configure Redux store with Redux Persist
8. Create mid-level hooks
9. Update useDashboardData to orchestrate everything
10. Wire up App.tsx with providers
11. Update Dashboard component to use real data

## Edge Cases

### Empty State Handling

- First-time user: Generate mock data automatically
- User deletes all holdings: Show empty state with "Add Asset" CTA

### API Failures

- Stock price fails: Show last known value with warning indicator
- All prices fail: Show holdings with purchase prices, disable P/L
- Historical data fails: Disable chart, show message

### localStorage Issues

- Quota exceeded: Warn user, remove old data
- Disabled: Fall back to in-memory only, warn user
- Corrupted: Reset to initial state, regenerate mock data

### Rate Limiting

- Finnhub 429: Exponential backoff, show cached data
- Alpha Vantage limit: Cache aggressively, warn user about chart limits
- CoinGecko 429: Similar to Finnhub

## Performance Considerations

### Batch Requests

- Combine multiple stock symbols into single query where possible
- Use Promise.all for parallel independent requests

### Memoization

- Portfolio calculations expensive with many holdings
- Memoize selectors in Redux
- Use useMemo for derived data in components

### Code Splitting

- Lazy load chart library
- Consider lazy loading dashboard route (already have routing)

## Testing Strategy

### Unit Tests

- SeededRandom: Deterministic output
- generateMockHoldings: Same seed = same holdings
- Calculation utilities: Edge cases (0 holdings, negative P/L)

### Integration Tests

- Redux slice: Add/remove holdings, persist rehydration
- useDashboardData: Combines Redux + React Query correctly
- Full flow: First-time user → sees mock data → adds asset → persists

### E2E Tests (Optional)

- Load app → see dashboard → add asset → refresh → data persists
