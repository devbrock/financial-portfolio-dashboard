import { describe, expect, it } from 'vitest';
import { addAssetFormSchema } from '../addAssetFormSchema';

describe('addAssetFormSchema', () => {
  it('accepts valid stock input', () => {
    const result = addAssetFormSchema.safeParse({
      assetSelection: 'stock:AAPL',
      assetType: 'stock',
      symbol: 'AAPL',
      quantity: 10,
      purchasePrice: 150,
      purchaseDate: '2024-01-15',
    });

    expect(result.success).toBe(true);
  });

  it('accepts valid crypto input with decimals', () => {
    const result = addAssetFormSchema.safeParse({
      assetSelection: 'crypto:bitcoin',
      assetType: 'crypto',
      symbol: 'bitcoin',
      quantity: 0.5,
      purchasePrice: 45000,
      purchaseDate: '2024-01-15',
    });

    expect(result.success).toBe(true);
  });

  it('rejects negative quantity', () => {
    const result = addAssetFormSchema.safeParse({
      assetSelection: 'stock:AAPL',
      assetType: 'stock',
      symbol: 'AAPL',
      quantity: -5,
      purchasePrice: 150,
      purchaseDate: '2024-01-15',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('quantity');
  });

  it('rejects zero purchase price', () => {
    const result = addAssetFormSchema.safeParse({
      assetSelection: 'stock:AAPL',
      assetType: 'stock',
      symbol: 'AAPL',
      quantity: 5,
      purchasePrice: 0,
      purchaseDate: '2024-01-15',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('purchasePrice');
  });

  it('rejects future purchase dates', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const result = addAssetFormSchema.safeParse({
      assetSelection: 'stock:AAPL',
      assetType: 'stock',
      symbol: 'AAPL',
      quantity: 5,
      purchasePrice: 150,
      purchaseDate: futureDate,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Purchase date cannot be in the future');
  });

  it('rejects empty symbol', () => {
    const result = addAssetFormSchema.safeParse({
      assetSelection: 'stock:AAPL',
      assetType: 'stock',
      symbol: '',
      quantity: 5,
      purchasePrice: 150,
      purchaseDate: '2024-01-15',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('symbol');
  });

  it('rejects invalid asset type', () => {
    const result = addAssetFormSchema.safeParse({
      assetSelection: 'stock:AAPL',
      assetType: 'bond',
      symbol: 'AAPL',
      quantity: 5,
      purchasePrice: 150,
      purchaseDate: '2024-01-15',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('assetType');
  });
});
