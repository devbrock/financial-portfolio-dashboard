# 🌟 Orion — Financial Portfolio Dashboard

<div align="center">

![Orion Logo](./src/assets/orion_logo_light.svg)

**A professional-grade investment tracking dashboard for stocks and cryptocurrencies**

*Real-time market data • Interactive charts • Responsive design • Accessible by default*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Coverage](https://img.shields.io/badge/Coverage-80%25+-success)](./coverage/)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [API Keys](#api-keys)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Available Scripts](#-available-scripts)
- [Running Tests](#-running-tests)
- [Architecture](#-architecture)
  - [Project Structure](#project-structure)
  - [State Management Strategy](#state-management-strategy)
  - [API Integration](#api-integration)
  - [Component Design](#component-design)
- [Design Decisions](#-design-decisions)
- [Known Limitations](#-known-limitations)
- [Future Improvements](#-future-improvements)

---

## 🌌 Overview

**Orion** is a responsive financial portfolio dashboard that empowers users to track their stock and cryptocurrency investments in one unified interface. Named after the constellation that has guided travelers for millennia, Orion helps navigate the complex world of personal finance with clarity and precision.

Built from the ground up with **React 19**, **TypeScript**, and a custom component library, Orion delivers a polished, executive-ready experience that works seamlessly across desktop, tablet, and mobile devices.

---

## ✨ Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **Portfolio Dashboard** | At-a-glance view of total portfolio value, daily P/L (amount & percentage), and asset allocation breakdown |
| **Multi-Asset Support** | Track both stocks and cryptocurrencies in a single unified portfolio |
| **Real-time Prices** | Auto-refresh market prices every 60 seconds with visual update indicators |
| **Performance Charts** | Interactive line charts with selectable time ranges (7d, 30d, 90d, 1y) |
| **Watchlist** | Monitor additional symbols without adding them to your portfolio |
| **Transactions & Holdings Management** | Add, edit, and remove assets with form validation and confirmation dialogs |

### User Experience

| Feature | Description |
|---------|-------------|
| **Dark/Light Mode** | Theme toggle with persistence across sessions |
| **Responsive Design** | Mobile-first approach with optimized layouts for every screen size |
| **Accessibility** | WCAG AA compliant with full keyboard navigation and screen reader support |
| **Elegant Loading States** | Skeleton loaders and status indicators that don't disrupt user flow |
| **Toast Notifications** | Contextual feedback for all user actions |

### Bonus Features

| Feature | Description |
|---------|-------------|
| **AI Assistant** | Chat-based portfolio insights powered by natural language processing |
| **Market Overview** | Browse major indices, sector performance, and earnings calendar |
| **News Feed** | Company-specific and market-wide news aggregation |
| **Price Alerts** | Browser notifications for significant price movements |
| **CSV Exportds** | Export portfolio data to CSV for reporting and analysis |

---

## 🛠 Tech Stack

### Core Framework
- **React 19** — Latest React with concurrent features
- **TypeScript 5.9** — Strict mode enabled, zero `any` types
- **Vite 7** — Lightning-fast HMR and optimized production builds

### State Management
- **Redux Toolkit** — Client state (holdings, preferences, watchlist)
- **Redux Persist** — localStorage persistence with corruption handling
- **TanStack React Query** — Server state (prices, profiles, historical data)

### Routing & Navigation
- **TanStack Router** — Type-safe file-based routing with automatic code splitting

### Styling & UI
- **TailwindCSS 4** — Utility-first styling with custom design tokens
- **Class Variance Authority** — Type-safe component variants
- **Lucide React** — Beautiful, consistent iconography

### Data Visualization
- **Recharts** — Composable charting with accessibility support

### Forms & Validation
- **React Hook Form** — Performant forms with minimal re-renders
- **Zod** — Schema-first validation with TypeScript inference

### Testing
- **Vitest** — Fast unit and integration testing
- **React Testing Library** — User-centric component testing
- **MSW** — API mocking for reliable integration tests
- **jest-axe** — Automated accessibility testing

### Developer Experience
- **Storybook** — Component documentation and visual testing
- **ESLint** — Strict linting with zero warnings policy
- **Prettier** — Consistent code formatting with Tailwind plugin

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm 10+** or **pnpm** as package manager

### API Keys

Orion integrates with multiple financial APIs. You'll need to register for the following:

| API | Purpose | Rate Limit | Registration |
|-----|---------|------------|--------------|
| **Finnhub** | Stock quotes, profiles, symbol search | 60 calls/minute | [Register →](https://finnhub.io/register) |
| **Alpha Vantage** | Historical stock data | 25 calls/day | [Register →](https://www.alphavantage.co/support/#api-key) |
| **CoinGecko** | Crypto prices, profiles, charts | Free tier with limits | No key required |

> 💡 **Tip:** Finnhub is required for core stock functionality. Alpha Vantage is optional but recommended for historical charts.

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/financial-portfolio-dashboard.git
   cd financial-portfolio-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env
   ```

4. **Add your API keys** to `.env` (see [Environment Variables](#environment-variables))

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open in browser**

   Navigate to [http://localhost:5173](http://localhost:5173)

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Required - Finnhub API for stock quotes and search
VITE_FINNHUB_API_KEY=your_finnhub_api_key_here

# Optional - Alpha Vantage for historical stock data
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Optional - OpenRouter API for AI assistant feature
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
```

> ⚠️ **Security Note:** Never commit your `.env` file. It's already included in `.gitignore`.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | TypeScript compile + production build |
| `npm run preview` | Preview production build locally |
| `npm run typecheck` | Run TypeScript type checking without emit |
| `npm run lint` | Run ESLint across the codebase |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting without changes |
| `npm run test` | Run Vitest test suite |
| `npm run test:coverage` | Run tests with coverage report (80% threshold) |
| `npm run storybook` | Start Storybook component explorer |
| `npm run build-storybook` | Build static Storybook site |

### Verification Commands

Your project should pass all these checks:

```bash
npm install         # Installs without errors
npm run dev         # Starts dev server on http://localhost:5173
npm run build       # Builds without TypeScript or ESLint errors
npm run test:coverage  # Passes with ≥80% coverage
npm run lint        # Zero warnings
```

---

## 🧪 Running Tests

The test suite uses **Vitest** with **React Testing Library** and **MSW** for API mocking.

### Run All Tests

```bash
npm run test
```

### Run with Coverage Report

```bash
npm run test:coverage
```

This generates:
- **Terminal output** with coverage summary
- **HTML report** at `coverage/index.html`
- **LCOV report** at `coverage/lcov.info`

### Coverage Thresholds

The project enforces 80% minimum coverage across all metrics:

| Metric | Threshold |
|--------|-----------|
| Lines | 80% |
| Functions | 80% |
| Branches | 80% |
| Statements | 80% |

### Run Specific Tests

```bash
# Run tests matching a pattern
npm run test -- --filter "portfolioSlice"

# Run tests in watch mode (during development)
npm run test -- --watch
```

### Test Organization

Tests are co-located with their source files in `__tests__` directories:

```
src/
├── features/
│   └── portfolio/
│       ├── portfolioSlice.ts
│       └── __tests__/
│           └── portfolioSlice.test.ts
```

---

## 🏗 Architecture

### Project Structure

```
src/
├── components/           # Shared UI component library (design system)
│   ├── Button/           # Each component has its own directory
│   │   ├── Button.tsx    # Component implementation
│   │   ├── Button.types.ts  # TypeScript interfaces
│   │   ├── Button.styles.ts # CVA variant definitions
│   │   ├── Button.stories.tsx # Storybook stories
│   │   └── index.ts      # Barrel export
│   └── ...
│
├── features/             # Feature-based modules (vertical slices)
│   ├── dashboard/        # Main dashboard feature
│   │   ├── components/   # Feature-specific components
│   │   ├── hooks/        # Feature-specific hooks
│   │   ├── __tests__/    # Feature tests
│   │   └── Dashboard.tsx # Feature entry point
│   ├── portfolio/        # Portfolio state & data hooks
│   ├── market/           # Market overview feature
│   ├── news/             # News feed feature
│   ├── assistant/        # AI chat assistant
│   ├── auth/             # Authentication (mock)
│   ├── shell/            # App shell (layout, navigation)
│   └── navigation/       # Navigation configuration
│
├── services/             # External API integration
│   └── api/
│       ├── clients/      # Axios client instances
│       └── functions/    # API call functions
│
├── queryOptions/         # TanStack Query configurations
├── store/                # Redux store configuration
├── hooks/                # Shared custom hooks
├── utils/                # Pure utility functions
├── types/                # Shared TypeScript definitions
├── schemas/              # Zod validation schemas
├── routes/               # TanStack Router route definitions
└── test/                 # Test utilities and MSW setup
```

### State Management Strategy

Orion employs a **dual-store architecture** that cleanly separates concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        State Architecture                        │
├─────────────────────────────┬───────────────────────────────────┤
│       Redux Toolkit         │        TanStack Query             │
│     (Client State)          │       (Server State)              │
├─────────────────────────────┼───────────────────────────────────┤
│ • Portfolio holdings        │ • Live market prices              │
│ • Watchlist items           │ • Company/coin profiles           │
│ • User preferences          │ • Historical price data           │
│ • Theme settings            │ • Search results                  │
│ • Sort preferences          │ • News articles                   │
├─────────────────────────────┼───────────────────────────────────┤
│ ✓ Persisted (localStorage)  │ ✗ Never persisted                 │
│ ✓ Predictable mutations     │ ✓ Automatic cache invalidation    │
│ ✓ Offline-safe              │ ✓ Background refetching           │
│ ✓ DevTools integration      │ ✓ Retry with backoff              │
└─────────────────────────────┴───────────────────────────────────┘
```

**Why this split?**

- **Redux** excels at managing user-owned data that needs predictable persistence and cross-feature access. Holdings and preferences are never stale—they're the source of truth.
  
- **React Query** shines for server data that benefits from caching, deduplication, and automatic background updates. Market prices need to be fresh, not persisted.

This is like having two filing cabinets: one for your personal documents (Redux) that you control completely, and one for newspapers (React Query) that refreshes automatically each morning.

### API Integration

| API | Client | Purpose | Caching Strategy |
|-----|--------|---------|------------------|
| **Finnhub** | `finnhubClient` | Stock quotes, profiles, symbol search | 60s stale time |
| **Alpha Vantage** | `alphaVantageClient` | Historical daily stock prices | 24h cache (rate limit protection) |
| **CoinGecko** | `coinGeckoClient` | Crypto prices, profiles, markets | 60s stale time |

All API clients are configured with:
- **Centralized error handling** via Axios interceptors
- **Rate limit detection** with exponential backoff
- **User-friendly error messages** (no technical jargon exposed)

### Component Design

The component library follows these principles:

1. **Single Responsibility** — Each component does one thing well
2. **Composition over Configuration** — Build complex UIs from simple primitives
3. **Type-Safe Variants** — CVA for exhaustive, type-checked styling options
4. **Accessibility First** — ARIA attributes, keyboard navigation, focus management

```tsx
// Example: Type-safe Button with variants
<Button variant="primary" size="lg" loading={isSubmitting}>
  Save Changes
</Button>
```

---

## 💡 Design Decisions

### Why Redux Toolkit + React Query (not just one)?

We use both because they solve different problems optimally. Redux provides predictable, debuggable state for user data that must persist offline. React Query provides automatic cache management and background sync for ephemeral server data. Trying to do both with one tool leads to awkward compromises.

### Why TanStack Router?

TanStack Router offers type-safe routing with automatic code splitting at the route level. Combined with lazy-loaded modals, this keeps the initial bundle lean while preserving a snappy navigation experience.

### Why a Custom Component Library?

Per the technical requirements, no UI component libraries (Material-UI, Chakra, etc.) were used. But it was important to me that this application have a consistent look and feel to the Orion Financial brand, so that reviewers would easily be able to invision this as an actual product. So I tracked down the actual branding kit that was used by Paradigm to create the Orion Financial brand. I used this branding kit to create a custom design spec sheet for the component library.Every component, from buttons to modals to charts, is built from scratch with TailwindCSS. This ensures complete control over accessibility, styling, and bundle size.

### Why Recharts?

Recharts offers a compositional API that integrates naturally with React's component model. It supports accessibility out of the box and works seamlessly with our responsive design requirements.

### Why Cache Historical Data in Redux?

Alpha Vantage has a strict 25 requests/day limit. By caching historical stock data in Redux (which persists to localStorage), we minimize redundant API calls across sessions. The cache includes timestamps for staleness checks.

---

## ⚠️ Known Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| **Alpha Vantage rate limits** | Historical charts may be delayed or show partial data | Data is cached aggressively; consider premium API tier for production |
| **Polling, not WebSockets** | Prices update every 60s, not in real-time | Acceptable for personal portfolio tracking; would need WebSocket upgrade for trading |
| **localStorage dependency** | Private browsing modes may lose data | Graceful degradation with warning toast; could add cloud sync |
| **US-focused stock coverage** | International exchanges have limited support | Primarily a Finnhub limitation; could add additional API sources |

---

## 🔮 Future Improvements

If given more time, the following enhancements would be prioritized:

### Medium Priority
- [ ] **Benchmark Comparison** — Overlay S&P 500 performance on portfolio charts
- [ ] **Advanced Charts** — Candlestick views, volume indicators, technical analysis
- [ ] **WebSocket Streaming** — True real-time price updates for active trading

### Nice to Have
- [ ] **Offline Support** — Service worker for offline portfolio viewing
- [ ] **Push Notifications** — Mobile push for price alerts (currently browser-only)
- [ ] **Portfolio Rebalancing** — Suggestions based on target allocation

---

## 📄 License

This project was built as a technical assessment and is not licensed for production use.

---

<div align="center">

**Built with ☕, ❤️ and TypeScript**

</div>
