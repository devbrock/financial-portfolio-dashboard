Lead UI Software Engineer

Technical Assessment

**Financial Portfolio Dashboard**

**Duration:** 6-8 hours  
**Deadline:** 14 days from receipt

**Overview**

**Build a personal finance dashboard that tracks investment portfolios across stocks and cryptocurrencies using real-time market data from free financial APIs.**

**Important:** Your completed application will be presented to upper management as part of the final evaluation. The visual design, user experience, responsiveness, and overall polish of the UI are critical success factors.

**Required Technology Stack**

- **Framework:** React 18+ with TypeScript, Vite
- **State Management:** Redux Toolkit with Redux Persist
- **Data Fetching:** React Query (@tanstack/react-query) with Axios
- **Forms:** React Hook Form with Zod validation
- **Styling:** TailwindCSS (responsive design required)
- **Testing:** Vitest with React Testing Library
- **Code Quality:** ESLint, Prettier, TypeScript strict mode

**Available APIs**

Choose any combination of these free financial APIs:

- **Alpha Vantage** - Stock quotes, historical data (25 requests/day)
  - Register: <https://www.alphavantage.co/support/#api-key>
- **Finnhub** - Real-time stock prices (60 calls/minute)
  - Register: <https://finnhub.io/register>
- **CoinGecko** - Cryptocurrency data (no authentication required)
  - Docs: <https://www.coingecko.com/en/api/documentation>
- **Exchange Rates API** - Currency conversion (no authentication required)
  - Docs: <https://www.exchangerate-api.com/docs>

**Core Features**

**1\. Portfolio Dashboard**

Display portfolio overview with total value, daily P/L, and asset allocation visualization.

**Requirements:**

- Total portfolio value in USD
- Daily profit/loss (amount and percentage)
- Asset allocation chart (stocks vs crypto)
- Auto-refresh prices every 60 seconds
- Elegant loading states and error handling
- Last updated timestamp

**State Architecture:**

- Redux Toolkit for portfolio holdings (client state)
- React Query for live market prices (server state)
- Redux Persist for localStorage persistence

**2\. Add Asset Form**

Allow users to add stocks or cryptocurrencies to their portfolio.

**Requirements:**

- Fields: Symbol, Quantity, Purchase Price, Purchase Date, Asset Type
- Real-time validation with Zod schemas
- Auto-uppercase symbol conversion
- Debounced search (300ms)
- Optimistic updates for immediate feedback
- Toast notifications for success/error states
- Prevent duplicate symbols

**3\. Holdings List**

Display all portfolio holdings with current market values.

**Requirements:**

- Show: Symbol, Quantity, Purchase Price, Current Price, Total Value, P/L, Purchase Date
- Color-coded profit (green) and loss (red) indicators
- Multi-column sorting capability
- Remove asset with confirmation dialog
- Fully responsive (card layout on mobile, table on desktop)
- Smooth transitions and animations

**4\. Performance Chart**

Visualize portfolio value over time.

**Requirements:**

- Line chart with selectable time ranges: 7d, 30d, 90d, 1y
- Interactive tooltips on hover
- Percentage change display for selected period
- Responsive chart sizing
- Loading states during data fetch
- Choose any charting library (recharts, chart.js, etc.)

**5\. Real-time Price Updates**

Keep portfolio values current with automatic price refreshes.

**Requirements:**

- Auto-refresh every 60 seconds using React Query
- Visual indicators when prices update
- "Last updated: X seconds ago" display
- Graceful handling of API rate limits
- User-friendly error messages with retry options

**Data Persistence**

Portfolio holdings must persist across browser sessions using Redux Persist with localStorage.

**What to Persist:**

- All portfolio holdings (symbol, quantity, purchase price, date, type)
- User preferences (optional: currency, theme, sort preferences)

**What NOT to Persist:**

- Market prices (always fetch fresh via React Query)
- API responses

**Edge Cases to Handle:**

- Empty state (first-time user)
- Corrupted localStorage data
- localStorage quota exceeded
- localStorage disabled in browser

**UI/UX Requirements**

**Visual Design:**

- Professional, modern interface suitable for presentation to executives
- Consistent design system (colors, typography, spacing)
- Thoughtful use of white space
- Clear visual hierarchy
- Smooth animations and transitions (consider Framer Motion or CSS transitions)

**Responsiveness:**

- Mobile-first approach
- Breakpoints: mobile (&lt; 640px), tablet (640-1024px), desktop (&gt; 1024px)
- Touch-friendly interactions on mobile
- Optimized layouts for each screen size

**Accessibility:**

- WCAG AA compliance
- Keyboard navigation for all interactive elements
- Proper ARIA labels and roles
- Screen reader friendly
- Sufficient color contrast
- Focus indicators

**User Experience:**

- Intuitive navigation and information architecture
- Clear feedback for all user actions
- Helpful error messages
- Loading states that don't disrupt flow
- Empty states with clear calls-to-action
- Confirmation dialogs for destructive actions

**Technical Requirements**

**Architecture**

**Project Structure:**

src/  
features/ # Feature-based modules  
portfolio/  
components/  
hooks/  
portfolioSlice.ts  
\__tests_\_/  
assets/  
components/  
schemas/  
\__tests_\_/  
services/ # API clients and external services  
api/  
hooks/ # Shared custom hooks  
components/ # Shared UI components  
utils/ # Utility functions  
types/ # TypeScript type definitions  
test/ # Test setup and utilities

**State Management:**

- Clear separation: Redux for client state, React Query for server state
- Avoid prop drilling (use composition or context where appropriate)
- Implement proper error boundaries

**Component Design:**

- Maximum 200 lines per component
- Extract complex logic into custom hooks
- Reusable, composable components
- Single Responsibility Principle

**TypeScript**

- Strict mode enabled
- No any types (use unknown if necessary)
- Proper interfaces for all data structures
- Discriminated unions for asset types
- Type-safe API responses
- Proper typing for React Query hooks and Redux slices

**Performance**

**Benchmarks:**

- Initial page load: < 3 seconds
- Time to Interactive: < 5 seconds
- Lighthouse Performance score: > 80

**Optimization Techniques:**

- Code splitting for heavy dependencies (chart library)
- Lazy loading for routes (if implementing routing)
- Memoization for expensive calculations (portfolio totals, allocations)
- Debouncing for search inputs
- Optimistic updates for better perceived performance
- Proper React Query cache configuration

**Error Handling**

**API Errors:**

- Axios interceptors for global error handling
- Rate limiting (429) with exponential backoff
- Network errors with retry logic
- User-friendly error messages (avoid technical jargon)

**Application Errors:**

- Error boundaries to catch React errors
- Graceful degradation when features fail
- Clear recovery paths for users

**Testing Requirements**

**Minimum Coverage:** 80% across lines, functions, branches, and statements

**Test Strategy**

**Unit Tests:**

- Redux slices: actions, reducers, selectors, edge cases
- Custom hooks: React Query hooks, calculation functions
- Utility functions: formatting, calculations, validations
- Zod schemas: valid inputs, invalid inputs, boundary cases

**Integration Tests:**

- Complete user flows: add asset, remove asset, view portfolio
- Form submission with validation
- API integration with mocked responses (MSW recommended)
- Redux Persist rehydration
- Error handling scenarios

**Component Tests:**

- User interactions (clicks, form inputs, navigation)
- Conditional rendering (loading, error, empty states)
- Accessibility (keyboard navigation, ARIA attributes)
- Responsive behavior (if feasible)

**Quality Over Quantity:** We value meaningful tests that catch real bugs over achieving coverage metrics. Focus on testing critical paths and edge cases.

**Setup & Dependencies**

**Initial Setup**

npm create vite@latest financial-portfolio-dashboard -- --template react-ts

cd financial-portfolio-dashboard

**Required Dependencies**

\# Core

npm install @reduxjs/toolkit react-redux redux-persist \\

@tanstack/react-query @tanstack/react-query-devtools \\

axios react-hook-form @hookform/resolvers zod \\

clsx tailwind-merge

\# UI & Utilities

npm install \[your-chart-library\] date-fns react-icons

\# Dev Dependencies

npm install -D vitest @testing-library/react @testing-library/jest-dom \\

@testing-library/user-event @vitest/coverage-v8 jsdom \\

tailwindcss autoprefixer postcss \\

prettier prettier-plugin-tailwindcss

**Configuration**

You must configure:

- **TypeScript** - Strict mode, path aliases (@/\*, @/features/\*, etc.)
- **Vite** - Path aliases, code splitting for vendor chunks
- **Vitest** - jsdom environment, 80% coverage thresholds, test setup file
- **TailwindCSS** - Content paths, custom theme (colors, fonts)
- **ESLint** - No any types (error), unused vars, console warnings
- **Prettier** - Consistent formatting with Tailwind plugin
- **Environment Variables** - .env.example with templates for chosen APIs

**Verification**

Your project must:

npm install # Installs without errors

npm run dev # Starts dev server

npm run build # Builds without TypeScript or ESLint errors

npm run test:coverage # Passes with ≥80% coverage

npm run lint # Zero warnings

**Technical Constraints**

- **No UI Component Libraries:** Build all UI components from scratch (no Material-UI, Ant Design, Chakra, etc.)
- **TypeScript Strict Mode:** Zero any types in your code
- **Performance Budget:** Lighthouse Performance score > 80
- **Bundle Size:** Initial load < 500KB (gzipped)
- **Accessibility:** WCAG AA compliance minimum
- **Browser Support:** Modern browsers (last 2 versions of Chrome, Firefox, Safari, Edge)

**Bonus Features (Optional)**

These are **not** required but demonstrate additional expertise:

- **Currency Conversion:** View portfolio in multiple currencies (EUR, GBP, JPY)
- **Export Functionality:** Export portfolio data to CSV or PDF
- **Dark Mode:** Theme toggle with persistence
- **Benchmark Comparison:** Compare portfolio performance against S&P 500 or other indices
- **Transaction History:** Track and display all buy/sell transactions with filtering
- **Advanced Charts:** Candlestick charts, volume indicators, technical analysis
- **Notifications:** Browser notifications for significant price changes
- **Offline Support:** Service worker for offline functionality

**What We're Evaluating**

**Architecture & Design Decisions**

- Clear separation of concerns (features, services, hooks, utilities)
- Appropriate state management choices (Redux vs React Query vs Context)
- Scalable folder structure that supports growth
- Thoughtful component composition and reusability
- Well-designed custom hooks for shared logic

**Code Quality**

- Clean, readable, maintainable code
- Consistent naming conventions
- Proper abstraction levels
- DRY principles without over-engineering
- Meaningful variable and function names
- Strategic use of comments for complex logic

**TypeScript Proficiency**

- Strict mode compliance
- Proper type definitions for all data structures
- Type-safe API responses and Redux state
- Discriminated unions where appropriate
- Generic types for reusable components/hooks
- No type assertions unless absolutely necessary

**Testing Strategy**

- Comprehensive test coverage (80%+ with meaningful tests)
- Proper test organization and naming
- Effective use of mocking (MSW for APIs)
- Testing critical user flows
- Edge case coverage
- Accessibility testing

**Performance & Optimization**

- Efficient rendering (proper memoization)
- Code splitting and lazy loading
- Optimized bundle size
- Fast initial load and Time to Interactive
- Smooth animations and transitions
- Proper React Query cache configuration

**UI/UX Excellence**

- **Visual Design:** Professional, polished interface suitable for executive presentation
- **Responsiveness:** Seamless experience across all device sizes
- **Accessibility:** Keyboard navigation, screen reader support, WCAG compliance
- **User Experience:** Intuitive flows, helpful feedback, graceful error handling
- **Attention to Detail:** Consistent spacing, typography, colors, animations

**Developer Experience**

- Clear, comprehensive README
- Easy setup process
- Well-organized code structure
- Meaningful commit messages (if using Git)
- Inline documentation for complex logic
- Consistent code formatting

**Submission Requirements**

**Deliverables**

- **Source Code**
  - Complete React application
  - All configuration files
  - .env.example with API key templates for chosen APIs
  - .gitignore excluding node_modules/, dist/, coverage/, .env
- **Documentation**
  - **README.md** with:
    - Project overview
    - Setup instructions (how to install and run)
    - Environment variables needed
    - How to run tests
    - Architecture decisions and rationale
    - API choices and why
    - Known limitations or trade-offs
    - Future improvements (if you had more time)
- **Tests**
  - All test files organized in \__tests_\_/ directories or co-located with source files
  - HTML coverage report in coverage/ directory
  - Coverage must meet 80% minimum threshold
- **Working Application**
  - Must run successfully with npm install && npm run dev
  - Must build without errors with npm run build
  - Must pass all tests with npm run test:coverage
  - Must pass linting with npm run lint

**Submission Format**

- **Preferred:** Public GitHub repository with clear commit history
- **Alternative:** ZIP file (exclude node_modules/, dist/, coverage/)

**Timeline**

You have **14 days** from receiving this assignment to submit your solution. Time to complete is **NOT** one of the criteria. Do not rush through this. I want to see your best work. Two weeks should be more than enough time.

**AI Assistance Expectations**

I **expect** you to use AI assistance for developing this. That said, it is **not** a requirement nor is it a judging criteria. If you do use an AI tool, I would like you to include your chat logs from your AI of choice in an ai.log file in the docs directory.

**Evaluation Process**

Your submission will go through a multi-stage review:

- **Technical Review:** Engineering team evaluates code quality, architecture, and testing
- **Functional Review:** Product team tests the application for usability and completeness
- **Executive Presentation:** Your application will be demonstrated to upper management, focusing on UI/UX quality and business value

**All three stages are equally important to your overall evaluation.**

**Questions?**

If you have questions about requirements or need clarification, please contact us within 48 hours of receiving this assignment.

We're excited to see what you build!

**Good luck!**
