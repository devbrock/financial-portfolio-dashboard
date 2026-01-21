import { SeededRandom } from './SeededRandom';
import type { Holding } from '@/types/portfolio';

/**
 * Stock pool with realistic price ranges for mock data
 */
const STOCK_POOL = [
  { symbol: 'AAPL', priceRange: [150, 200] },
  { symbol: 'MSFT', priceRange: [350, 420] },
  { symbol: 'GOOGL', priceRange: [130, 160] },
  { symbol: 'AMZN', priceRange: [140, 180] },
  { symbol: 'TSLA', priceRange: [200, 350] },
  { symbol: 'NVDA', priceRange: [450, 700] },
  { symbol: 'META', priceRange: [350, 500] },
] as const;

/**
 * Crypto pool with realistic price ranges
 */
const CRYPTO_POOL = [
  { symbol: 'bitcoin', priceRange: [40000, 70000] },
  { symbol: 'ethereum', priceRange: [2000, 4000] },
] as const;

/**
 * Generate random date within last N days
 */
function generateRandomDate(rng: SeededRandom, daysAgo: number): string {
  const now = Date.now();
  const millisecondsAgo = daysAgo * 24 * 60 * 60 * 1000;
  const randomTime = now - rng.nextInt(0, millisecondsAgo);
  return new Date(randomTime).toISOString().split('T')[0];
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Generate mock portfolio holdings based on seed.
 * Same seed will always generate the same holdings.
 */
export function generateMockHoldings(seed: string): Holding[] {
  const rng = new SeededRandom(seed);
  const holdings: Holding[] = [];

  // Determine number of assets (limit to reduce free API usage)
  const numStocks = 2;
  const numCrypto = 1;

  // Shuffle pools to get random selection
  const shuffledStocks = rng.shuffle([...STOCK_POOL]);
  const shuffledCrypto = rng.shuffle([...CRYPTO_POOL]);

  // Generate stock holdings
  for (let i = 0; i < numStocks; i++) {
    const stock = shuffledStocks[i];
    const [minPrice, maxPrice] = stock.priceRange;

    // Generate slightly older purchase price (usually lower than current)
    const priceFactor = rng.nextFloat(0.7, 0.95);
    const purchasePrice = Math.round(rng.nextFloat(minPrice, maxPrice) * priceFactor * 100) / 100;

    holdings.push({
      id: generateId(),
      symbol: stock.symbol,
      assetType: 'stock',
      quantity: rng.nextInt(5, 100),
      purchasePrice,
      purchaseDate: generateRandomDate(rng, 365), // Within last year
    });
  }

  // Generate crypto holdings
  for (let i = 0; i < numCrypto; i++) {
    const crypto = shuffledCrypto[i];
    const [minPrice, maxPrice] = crypto.priceRange;

    // Generate purchase price
    const priceFactor = rng.nextFloat(0.6, 1.1); // More volatility for crypto
    const purchasePrice = Math.round(rng.nextFloat(minPrice, maxPrice) * priceFactor * 100) / 100;

    // Crypto quantities are typically smaller
    const quantity = Math.round(rng.nextFloat(0.1, 10) * 1000) / 1000;

    holdings.push({
      id: generateId(),
      symbol: crypto.symbol,
      assetType: 'crypto',
      quantity,
      purchasePrice,
      purchaseDate: generateRandomDate(rng, 365),
    });
  }

  return holdings;
}
