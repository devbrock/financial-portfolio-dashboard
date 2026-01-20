import { useCallback, useMemo, useState } from 'react';
import { useSymbolSearch } from '@/hooks/useSymbolSearch';
import { useCryptoSearch } from '@/hooks/useCryptoSearch';
import type { ComboboxItem } from '@components';

type UseAssetSearchOptionsResult = {
  assetOptions: ComboboxItem[];
  isAssetSearchLoading: boolean;
  handleAssetQueryChange: (nextQuery: string) => void;
  selectedAssetLabel: string;
  setSelectedAssetLabel: (label: string) => void;
  resetAssetSearch: () => void;
};

export function useAssetSearchOptions(selectedAssetValue: string): UseAssetSearchOptionsResult {
  const [assetQuery, setAssetQuery] = useState('');
  const [selectedAssetLabel, setSelectedAssetLabel] = useState('');

  const handleAssetQueryChange = useCallback(
    (nextQuery: string) => {
      if (selectedAssetLabel && nextQuery === selectedAssetLabel) return;
      const trimmed = nextQuery.trim();
      setAssetQuery(trimmed.length >= 2 ? trimmed : '');
    },
    [selectedAssetLabel]
  );

  const { data: stockSearch, isFetching: isStockSearchLoading } = useSymbolSearch(assetQuery);
  const { data: cryptoSearch, isFetching: isCryptoSearchLoading } = useCryptoSearch(assetQuery);

  const assetOptions: ComboboxItem[] = useMemo(() => {
    const stockItems = (stockSearch?.result ?? [])
      .filter(result => result.symbol)
      .slice(0, 6)
      .map(result => ({
        value: `stock:${result.symbol.toUpperCase()}`,
        label: `Stock · ${result.displaySymbol} — ${result.description}`,
      }));
    const cryptoItems = (cryptoSearch?.coins ?? []).slice(0, 6).map(coin => ({
      value: `crypto:${coin.id.toLowerCase()}`,
      label: `Crypto · ${coin.symbol.toUpperCase()} — ${coin.name}`,
    }));
    const merged = [...stockItems, ...cryptoItems];
    if (
      selectedAssetValue &&
      selectedAssetLabel &&
      !merged.some(item => item.value === selectedAssetValue)
    ) {
      return [{ value: selectedAssetValue, label: selectedAssetLabel }, ...merged];
    }
    return merged;
  }, [stockSearch, cryptoSearch, selectedAssetLabel, selectedAssetValue]);

  const isAssetSearchLoading = isStockSearchLoading || isCryptoSearchLoading;

  const resetAssetSearch = useCallback(() => {
    setAssetQuery('');
    setSelectedAssetLabel('');
  }, []);

  return {
    assetOptions,
    isAssetSearchLoading,
    handleAssetQueryChange,
    selectedAssetLabel,
    setSelectedAssetLabel,
    resetAssetSearch,
  };
}
