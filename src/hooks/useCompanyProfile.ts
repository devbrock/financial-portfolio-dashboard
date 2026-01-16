import { useQuery } from "@tanstack/react-query";
import { GetCompanyProfileQueryOptions } from "@/queryOptions/GetCompanyProfileQueryOptions";

export const useCompanyProfile = (symbol: string) => {
  return useQuery(GetCompanyProfileQueryOptions(symbol));
};
