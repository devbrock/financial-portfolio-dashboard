import { describe, expect, it } from 'vitest';
import { generateMockHoldings } from '../generateMockHoldings';

describe('generateMockHoldings', () => {
  it('returns deterministic results for the same seed', () => {
    const holdingsA = generateMockHoldings('seed');
    const holdingsB = generateMockHoldings('seed');
    const stripIds = (holdings: typeof holdingsA) => holdings.map(({ id, ...rest }) => rest);
    expect(stripIds(holdingsA)).toEqual(stripIds(holdingsB));
  });

  it('returns holdings with required fields', () => {
    const holdings = generateMockHoldings('seed');
    expect(holdings.length).toBeGreaterThan(0);
    const holding = holdings[0];
    expect(holding.id).toBeTruthy();
    expect(holding.symbol).toBeTruthy();
    expect(holding.purchaseDate).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
