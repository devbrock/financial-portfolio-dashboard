import { useCallback, useMemo, useState } from 'react';
import type { HoldingRow, SortDir, SortKey } from '@/types/dashboard';
import { compareStrings } from '@/utils/compareStrings';

type HoldingsFilterSortResult = {
  holdingsQuery: string;
  setHoldingsQuery: (value: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  triggerSort: (key: SortKey) => void;
  visibleHoldings: readonly HoldingRow[];
};

/**
 * useHoldingsFilterSort
 * Handles holdings search + sorting logic.
 */
export function useHoldingsFilterSort(holdings: readonly HoldingRow[]): HoldingsFilterSortResult {
  const [holdingsQuery, setHoldingsQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const visibleHoldings: readonly HoldingRow[] = useMemo(() => {
    const q = holdingsQuery.trim().toLowerCase();
    const filtered = q
      ? holdings.filter(h => h.name.toLowerCase().includes(q) || h.ticker.toLowerCase().includes(q))
      : holdings;

    const dir = sortDir === 'asc' ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return dir * compareStrings(a.name, b.name);
        case 'date':
          return dir * compareStrings(a.dateIso, b.dateIso);
        case 'status':
          return dir * compareStrings(a.status, b.status);
        case 'volume':
          return dir * (a.volume - b.volume);
        case 'changePct':
          return dir * (a.changePct - b.changePct);
        case 'purchasePrice':
          return dir * (a.purchasePrice - b.purchasePrice);
        case 'priceUsd':
          return dir * (a.priceUsd - b.priceUsd);
        case 'pnlUsd':
          return dir * (a.pnlUsd - b.pnlUsd);
      }
    });

    return sorted;
  }, [holdings, holdingsQuery, sortDir, sortKey]);

  const triggerSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
        return;
      }
      setSortKey(key);
      setSortDir('asc');
    },
    [sortKey]
  );

  return {
    holdingsQuery,
    setHoldingsQuery,
    sortKey,
    sortDir,
    triggerSort,
    visibleHoldings,
  };
}
