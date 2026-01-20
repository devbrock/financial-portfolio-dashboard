# Financial Portfolio Dashboard

A responsive dashboard for tracking stock and crypto holdings with live prices,
performance insights, and portfolio allocation breakdowns. Built with React,
TypeScript, and Vite, it combines Redux for client state with React Query for
API-backed market data.

## Features

- Real-time portfolio tracking for stocks and cryptocurrencies
- Interactive performance charts with multiple time ranges
- Asset allocation visualization
- Watchlist functionality
- Dark/light mode
- Fully responsive design
- Accessible (WCAG AA compliant)

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **State Management:** Redux Toolkit + Redux Persist
- **Server State:** TanStack React Query
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest + React Testing Library + MSW

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### API Keys

This application requires API keys from:

1. **Finnhub** (required for stocks)
   - Register at: https://finnhub.io/register
   - Free tier: 60 calls/minute

2. **Alpha Vantage** (optional, for historical data)
   - Register at: https://www.alphavantage.co/support/#api-key
   - Free tier: 25 calls/day

3. **CoinGecko** (no key required)
   - Free tier with rate limits

### Installation

1. Clone the repository

   ```bash
   git clone [repo-url]
   cd financial-portfolio-dashboard
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create environment file

   ```bash
   cp .env.example .env
   ```

4. Add your API keys to `.env`

5. Start development server
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript in build mode without emitting files
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run storybook` - Start Storybook
- `npm run build-storybook` - Build Storybook

## Architecture

### Project Structure

```
src/
├── components/      # Shared UI components (design system)
├── features/        # Feature modules
│   ├── dashboard/   # Dashboard UI components
│   └── portfolio/   # Portfolio state & hooks
├── services/api/    # API clients
├── hooks/           # Shared hooks
├── queryOptions/    # React Query configurations
├── store/           # Redux store & slices
├── types/           # TypeScript definitions
├── utils/           # Utility functions
└── schemas/         # Zod validation schemas
```

### State Management Strategy

- **Redux Toolkit:** Client state (holdings, preferences, watchlist)
- **React Query:** Server state (live prices, company profiles)
- **Redux Persist:** Persists Redux state to localStorage

### Architecture Decisions

- Redux is used for user-owned, offline-safe state (holdings, preferences) because it needs
  predictable persistence and cross-feature access.
- React Query is reserved for market data because it benefits from caching, retries, and
  automatic background refetching without polluting the global store.
- Feature modules keep UI, hooks, and API calls together to reduce cross-feature coupling.
- Shared components live in `src/components` to keep visual styles consistent and reusable.

### API Integration

- **Finnhub:** Stock quotes, profiles, and symbol search for equities.
  Chosen for breadth of US equity coverage and a generous free tier.
- **Alpha Vantage:** Daily historical stock data for performance charts.
  Chosen for historical depth and predictable response shapes.
- **CoinGecko:** Crypto prices, profiles, search, and historical charts.
  Chosen for reliable crypto coverage without API key requirements.

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/path/to/test.test.ts
```

## Known Limitations

- Alpha Vantage free tier is limited to 25 requests/day and 1 request/second, so historical
  charts can be delayed or show partial data.
- Market data is pulled via polling (no WebSocket streaming), so updates are not truly real-time.
- Data freshness depends on third-party APIs and can be delayed during rate limiting.
- Portfolio persistence relies on `localStorage`, which can be unavailable in strict
  privacy modes or cleared by the user.
- Currency conversion and benchmarking features are not implemented yet.

## Future Improvements

- [ ] Currency conversion support
- [ ] CSV/PDF export
- [ ] Transaction history
- [ ] Benchmark comparison (S&P 500)
- [ ] Browser notifications for price alerts
