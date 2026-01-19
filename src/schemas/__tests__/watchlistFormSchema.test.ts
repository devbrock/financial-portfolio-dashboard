import { describe, expect, it } from 'vitest';
import { watchlistFormSchema } from '../watchlistFormSchema';

describe('watchlistFormSchema', () => {
  it('accepts valid stock watchlist input', () => {
    const result = watchlistFormSchema.safeParse({
      assetSelection: 'stock:AAPL',
      assetType: 'stock',
      symbol: 'AAPL',
    });

    expect(result.success).toBe(true);
  });

  it('accepts valid crypto watchlist input', () => {
    const result = watchlistFormSchema.safeParse({
      assetSelection: 'crypto:bitcoin',
      assetType: 'crypto',
      symbol: 'bitcoin',
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty selection', () => {
    const result = watchlistFormSchema.safeParse({
      assetSelection: '',
      assetType: 'stock',
      symbol: 'AAPL',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('assetSelection');
  });

  it('rejects invalid asset type', () => {
    const result = watchlistFormSchema.safeParse({
      assetSelection: 'stock:AAPL',
      assetType: 'bond',
      symbol: 'AAPL',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('assetType');
  });
});
