import { useQuery } from '@tanstack/react-query';
import { GetStockHistoricalDataQueryOptions } from '@/queryOptions/GetStockHistoricalDataQueryOptions';

export const useStockHistoricalData = (
  symbol: string,
  outputsize: 'compact' | 'full' = 'compact'
) => {
  return useQuery(GetStockHistoricalDataQueryOptions(symbol, outputsize));
};
