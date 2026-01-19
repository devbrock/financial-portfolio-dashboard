import { describe, expect, it } from 'vitest';
import { holdingSchema } from '../holdingSchema';

const baseHolding = {
  id: '1',
  symbol: 'AAPL',
  assetType: 'stock',
  quantity: 1,
  purchasePrice: 100,
  purchaseDate: '2024-01-01',
};

describe('holdingSchema', () => {
  it('accepts valid inputs', () => {
    const result = holdingSchema.safeParse(baseHolding);
    expect(result.success).toBe(true);
  });

  it('rejects invalid inputs', () => {
    const result = holdingSchema.safeParse({ ...baseHolding, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid dates', () => {
    const result = holdingSchema.safeParse({
      ...baseHolding,
      purchaseDate: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});
