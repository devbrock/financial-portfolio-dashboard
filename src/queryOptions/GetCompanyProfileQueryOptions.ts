import { queryOptions } from "@tanstack/react-query";
import { finnhubApi } from "@/services/api/functions/finnhubApi";

export type GetCompanyProfileQueryKey = readonly ["companyProfile", string];

const getCompanyProfile = async (symbol: string) => {
  const { data } = await finnhubApi.getCompanyProfile(symbol);
  return data;
};

const GetCompanyProfileQueryOptions = (symbol: string) => {
  return queryOptions({
    queryKey: ["companyProfile", symbol] as GetCompanyProfileQueryKey,
    queryFn: () => getCompanyProfile(symbol),
    // Company profile data rarely changes, cache for 24 hours
    staleTime: 86400000, // 24 hours in milliseconds
    gcTime: 86400000, // Keep in cache for 24 hours
  });
};

export { GetCompanyProfileQueryOptions };
