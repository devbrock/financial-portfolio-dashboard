import { describe, expect, it } from 'vitest';
import { ApiError } from '@/services/api/clients/apiError';
import { GetCompanyProfileQueryOptions } from '../GetCompanyProfileQueryOptions';
import { GetCryptoCoinQueryOptions } from '../GetCryptoCoinQueryOptions';
import { GetCryptoHistoricalDataQueryOptions } from '../GetCryptoHistoricalDataQueryOptions';
import { GetCryptoPriceQueryOptions } from '../GetCryptoPriceQueryOptions';
import { GetStockHistoricalDataQueryOptions } from '../GetStockHistoricalDataQueryOptions';
import { GetStockQuoteQueryOptions } from '../GetStockQuoteQueryOptions';
import { SearchCryptoQueryOptions } from '../SearchCryptoQueryOptions';
import { SearchSymbolQueryOptions } from '../SearchSymbolQueryOptions';

describe('query options', () => {
  it('builds stock and crypto query keys', () => {
    expect(GetStockQuoteQueryOptions('AAPL').queryKey).toEqual(['stockPrice', 'AAPL']);
    expect(GetCompanyProfileQueryOptions('AAPL').queryKey).toEqual(['companyProfile', 'AAPL']);
    expect(GetCryptoPriceQueryOptions({ ids: 'bitcoin', vs_currencies: 'usd' }).queryKey).toEqual([
      'cryptoPrice',
      { ids: 'bitcoin', vs_currencies: 'usd' },
    ]);
    expect(GetCryptoCoinQueryOptions('bitcoin', { localization: false }).queryKey).toEqual([
      'cryptoCoin',
      'bitcoin',
      { localization: false },
    ]);
    expect(SearchCryptoQueryOptions('btc').queryKey).toEqual(['cryptoSearch', 'btc']);
    expect(SearchSymbolQueryOptions('aapl', 'US').queryKey).toEqual(['symbolSearch', 'aapl', 'US']);
  });

  it('retries on rate limit errors', () => {
    const rateLimitError = new ApiError('rate limit', 429);
    const nonRateLimitError = new ApiError('bad request', 400);
    const optionsList = [
      GetCompanyProfileQueryOptions('AAPL'),
      GetCryptoCoinQueryOptions('bitcoin', { localization: false }),
      GetCryptoHistoricalDataQueryOptions('bitcoin', { vs_currency: 'usd', days: '7' }),
      GetCryptoPriceQueryOptions({ ids: 'bitcoin', vs_currencies: 'usd' }),
      GetStockHistoricalDataQueryOptions('AAPL', 'compact'),
      GetStockQuoteQueryOptions('AAPL'),
      SearchCryptoQueryOptions('btc'),
      SearchSymbolQueryOptions('aapl', 'US'),
    ];

    optionsList.forEach(options => {
      if (typeof options.retry !== 'function') {
        throw new Error('Expected retry to be a function');
      }
      expect(options.retry(2, rateLimitError)).toBe(true);
      expect(options.retry(3, rateLimitError)).toBe(false);
      expect(options.retry(0, nonRateLimitError)).toBe(true);
      expect(options.retry(1, nonRateLimitError)).toBe(false);
    });
  });

  it('builds retry delays with exponential backoff', () => {
    const options = GetStockQuoteQueryOptions('AAPL');
    if (typeof options.retryDelay !== 'function') {
      throw new Error('Expected retryDelay to be a function');
    }
    const retryError = new Error('retry');
    expect(options.retryDelay(0, retryError)).toBe(1000);
    expect(options.retryDelay(1, retryError)).toBe(2000);
    expect(options.retryDelay(4, retryError)).toBe(16000);
  });
});
