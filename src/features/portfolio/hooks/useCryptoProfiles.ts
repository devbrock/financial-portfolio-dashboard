import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GetCryptoMarketsQueryOptions } from '@/queryOptions/GetCryptoMarketsQueryOptions';
import type { CoinGeckoCoin, CoinGeckoMarketCoin } from '@/types/coinGecko';

const COIN_MARKETS_PARAMS = {
  vs_currency: 'usd',
  sparkline: false,
};

/**
 * Fetch coin profiles for multiple coin IDs in one batch request
 */
export function useCryptoProfiles(coinIds: string[]) {
  const sortedIds = useMemo(() => Array.from(new Set(coinIds)).sort(), [coinIds]);
  const params = useMemo(
    () => ({
      ...COIN_MARKETS_PARAMS,
      ids: sortedIds.join(','),
    }),
    [sortedIds]
  );

  const { data, isLoading, isError, error } = useQuery({
    ...GetCryptoMarketsQueryOptions(params),
    enabled: sortedIds.length > 0,
  });

  const profileMap = new Map<string, CoinGeckoCoin>();
  (data ?? []).forEach((coin: CoinGeckoMarketCoin) => {
    profileMap.set(coin.id, {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image
        ? {
            thumb: coin.image,
            small: coin.image,
            large: coin.image,
          }
        : undefined,
    });
  });

  return {
    profileMap,
    isLoading,
    isError,
    error: error ?? null,
  };
}
