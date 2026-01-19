import { useQuery } from '@tanstack/react-query';
import { SearchCryptoQueryOptions } from '@/queryOptions/SearchCryptoQueryOptions';

export const useCryptoSearch = (query: string) => {
  return useQuery(SearchCryptoQueryOptions(query));
};
