# Bug Fixes Summary

## Issues Identified and Fixed

### 1. ✅ Company Logos Not Displaying
**Problem**: Stock holdings weren't showing company logos
**Root Cause**: Company profiles weren't being fetched
**Solution**:
- Created `useStockProfiles` hook to fetch company profiles in parallel
- Updated `usePortfolioData` to fetch both quotes and profiles
- Pass logo and company name to `enrichHoldingWithPrice`

**Files Modified**:
- `src/features/portfolio/hooks/useStockProfiles.ts` (new)
- `src/features/portfolio/hooks/usePortfolioData.ts`

### 2. ✅ Remove Holding Not Working
**Problem**: Clicking remove on a holding didn't actually remove it
**Root Cause**: Remove button wasn't dispatching Redux action
**Solution**:
- Added `useAppDispatch` hook to Dashboard component
- Imported `removeHolding` action from portfolioSlice
- Wired up the Remove button to dispatch the action

**Files Modified**:
- `src/features/dashboard/Dashboard.tsx`

### 3. ⚠️ Stock Data Not Displaying Correctly (P/L, Change%)
**Problem**: Stocks showing $0.00 P/L and 0.0% change, but crypto works fine
**Root Cause**: Need to investigate - likely API data extraction issue
**Changes Made**:
- Updated `useStockPrices` to return full `quoteMap` instead of just prices
- Modified `usePortfolioData` to extract price from `quote?.c`
- All calculations look correct in `portfolioCalculations.ts`

**Next Steps**:
- Verify API responses are being received
- Check if there's a timing issue with React Query
- May need to add loading states or fallbacks

### 4. ⚠️ AssetSummaryCard Delta Pills Showing 0.0%
**Problem**: Asset cards show 0.0% for weekly delta
**Root Cause**: Likely related to issue #3 - stocks not getting valid P/L data
**Current Implementation**:
- Using `holding.plPct` as `weeklyDeltaPct`
- This is total P/L%, not weekly change (acceptable for MVP)
- If stocks have 0% P/L, cards will show 0%

**Dependencies**: Fixing issue #3 should resolve this

### 5. ℹ️ Profit Chart Total Not Updating
**Status**: This is actually working as designed
**Explanation**:
- All three time ranges (daily, weekly, monthly) end at `metrics.totalPL`
- This is correct - "Total profit" is your current cumulative profit
- The chart shows different trends, but converges to the same endpoint
- The percentage change DOES update (compares to start of each period)

**No Action Needed**: This is expected behavior for a portfolio tracker

### 6. ⚠️ Table P/L Column Showing $0.00 for Stocks
**Problem**: Holdings table shows $0 P/L for stocks but correct values for crypto
**Root Cause**: Same as issue #3
**Dependencies**: Fixing issue #3 should resolve this

## API Integration Status

### Stock Quotes (Finnhub)
- ✅ API client configured with proper headers
- ✅ Using `import.meta.env.VITE_FINNHUB_API_KEY`
- ✅ Query options set up with 60s refresh
- ⚠️ Need to verify responses are valid

### Company Profiles (Finnhub)
- ✅ API integration complete
- ✅ Fetching logos and company names
- ✅ Cached for 24 hours

### Crypto Prices (CoinGecko)
- ✅ Working correctly (user confirmed)
- ✅ Batch fetching multiple coins
- ✅ 60s auto-refresh

### Alpha Vantage (Historical Data)
- ✅ API client configured
- ✅ Using `import.meta.env.VITE_ALPHA_VANTAGE_API_KEY`
- ⏸️ Not yet used in dashboard (future feature)

## Data Flow Summary

```
1. Redux: Holdings (symbols, quantities, purchase prices, dates)
   ↓
2. Extract stock symbols & crypto IDs
   ↓
3. React Query: Parallel API requests
   ├─ Stock quotes (Finnhub)
   ├─ Company profiles (Finnhub)
   └─ Crypto prices (CoinGecko)
   ↓
4. Combine: Holdings + Current Prices + Profiles
   ↓
5. Calculate: P/L, allocation, metrics
   ↓
6. Transform: Dashboard UI format
   ↓
7. Render: Components
```

## Testing Recommendations

1. **Check Browser Console**:
   - Look for API errors (401, 429, network failures)
   - Verify API responses contain valid data
   - Check React Query DevTools if available

2. **Verify Environment Variables**:
   ```bash
   # In browser console:
   console.log(import.meta.env.VITE_FINNHUB_API_KEY)
   console.log(import.meta.env.VITE_ALPHA_VANTAGE_API_KEY)
   ```

3. **Test API Endpoints Directly**:
   ```bash
   # Test Finnhub quote
   curl "https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_KEY"

   # Test Finnhub profile
   curl "https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=YOUR_KEY"

   # Test CoinGecko
   curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
   ```

4. **Add Debug Logging**:
   - Log `quoteMap` size in `useStockPrices`
   - Log `holdingsWithPrice` in `usePortfolioData`
   - Log individual holding calculations

## Known Limitations

1. **Performance Data**: Currently mock data based on current P/L
   - Will need transaction history to show real historical performance
   - For now, shows reasonable trending patterns

2. **Weekly Delta**: Asset cards show total P/L%, not actual weekly change
   - Would need price history from 7 days ago
   - Acceptable approximation for MVP

3. **API Rate Limits**:
   - Finnhub: 60 calls/minute
   - Alpha Vantage: 25 calls/day
   - CoinGecko: 30 calls/minute
   - All have aggressive caching to stay within limits

## Next Steps

1. **Debug Stock Data Issue**:
   - Add console logging to track data flow
   - Verify API responses are valid
   - Check if symbols need different formatting

2. **Enhance Error Handling**:
   - Add error boundaries
   - Show user-friendly messages when APIs fail
   - Implement retry logic

3. **Add Loading States**:
   - Show skeletons while fetching data
   - Indicate when prices are updating
   - Handle empty states gracefully

4. **Performance Optimization**:
   - Consider debouncing rapid re-renders
   - Memoize expensive calculations
   - Lazy load chart components
