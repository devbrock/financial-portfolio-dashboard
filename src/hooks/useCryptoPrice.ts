import { useQuery } from '@tanstack/react-query';
import { GetCryptoPriceQueryOptions } from '@/queryOptions/GetCryptoPriceQueryOptions';
import type { SimplePriceParams } from '@functions/coinGeckoApi';

export const useCryptoPrice = (params: SimplePriceParams) => {
  return useQuery(GetCryptoPriceQueryOptions(params));
};
