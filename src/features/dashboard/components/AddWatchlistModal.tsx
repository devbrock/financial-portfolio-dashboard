import { useCallback, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Combobox, Modal, Text } from '@components';
import type { ComboboxItem } from '@components';
import { useSymbolSearch } from '@/hooks/useSymbolSearch';
import { useCryptoSearch } from '@/hooks/useCryptoSearch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addWatchlistItem } from '@/features/portfolio/portfolioSlice';
import type { AssetType, WatchlistItem } from '@/types/portfolio';
import { toast } from 'sonner';

const watchlistSchema = z.object({
  assetSelection: z.string().min(1, 'Select an asset from search'),
  assetType: z.enum(['stock', 'crypto']),
  symbol: z.string().min(1, 'Select an asset from search'),
});

type WatchlistFormValues = z.infer<typeof watchlistSchema>;

type AddWatchlistModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function generateWatchlistId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AddWatchlistModal(props: AddWatchlistModalProps) {
  const { open, onOpenChange } = props;
  const dispatch = useAppDispatch();
  const watchlist = useAppSelector(state => state.portfolio.watchlist);
  const [assetQuery, setAssetQuery] = useState('');
  const [selectedAssetLabel, setSelectedAssetLabel] = useState('');

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    register,
    formState: { errors, isSubmitting },
  } = useForm<WatchlistFormValues>({
    resolver: zodResolver(watchlistSchema),
    defaultValues: {
      assetSelection: '',
      assetType: 'stock',
      symbol: '',
    },
  });

  const selectedAssetValue = useWatch({
    control,
    name: 'assetSelection',
  });
  const selectedSymbol = useWatch({
    control,
    name: 'symbol',
  });
  const selectedAssetType = useWatch({
    control,
    name: 'assetType',
  });

  const isDuplicateAsset = useMemo(() => {
    if (!selectedSymbol) return false;
    return watchlist.some(
      item =>
        item.assetType === selectedAssetType &&
        item.symbol.toLowerCase() === selectedSymbol.toLowerCase()
    );
  }, [selectedAssetType, selectedSymbol, watchlist]);

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

  const resetForm = useCallback(() => {
    setAssetQuery('');
    setSelectedAssetLabel('');
    reset({
      assetSelection: '',
      assetType: 'stock',
      symbol: '',
    });
  }, [reset]);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetForm();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm]
  );

  const onSubmitAddWatchlist = useCallback(
    (values: WatchlistFormValues) => {
      const assetType = values.assetType as AssetType;
      const normalizedSymbol =
        assetType === 'stock'
          ? values.symbol.trim().toUpperCase()
          : values.symbol.trim().toLowerCase();

      const watchlistItem: WatchlistItem = {
        id: generateWatchlistId(),
        symbol: normalizedSymbol,
        assetType,
      };

      dispatch(addWatchlistItem(watchlistItem));
      toast.success('Added to watchlist.');
      resetForm();
      onOpenChange(false);
    },
    [dispatch, onOpenChange, resetForm]
  );

  const handleInvalid = useCallback(() => {
    toast.error('Select an asset to add to your watchlist.');
  }, []);

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Add to watchlist"
      description="Track live price updates for a stock or crypto."
      footer={
        <>
          <Button variant="secondary" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="add-watchlist-form"
            disabled={isSubmitting || isDuplicateAsset}
          >
            Add to Watchlist
          </Button>
        </>
      }
    >
      <form
        id="add-watchlist-form"
        onSubmit={handleSubmit(onSubmitAddWatchlist, handleInvalid)}
        className="space-y-3"
      >
        <div>
          <Text as="label" htmlFor="watchlistSearch" size="sm">
            Search asset
          </Text>
          <Controller
            control={control}
            name="assetSelection"
            render={({ field }) => (
              <Combobox
                id="watchlistSearch"
                placeholder="Search RBLX, Adobe, BTC, Ethereum..."
                items={assetOptions}
                value={field.value}
                onValueChange={nextValue => {
                  field.onChange(nextValue);
                  const selectedItem = assetOptions.find(item => item.value === nextValue);
                  setSelectedAssetLabel(selectedItem?.label ?? '');
                  const isStock = nextValue.startsWith('stock:');
                  const rawSymbol = nextValue.replace(isStock ? 'stock:' : 'crypto:', '');
                  setValue('assetType', isStock ? 'stock' : 'crypto', {
                    shouldValidate: true,
                  });
                  setValue('symbol', isStock ? rawSymbol.toUpperCase() : rawSymbol.toLowerCase(), {
                    shouldValidate: true,
                  });
                }}
                onInputChange={() => {
                  if (field.value) {
                    field.onChange('');
                    setSelectedAssetLabel('');
                    setValue('assetType', 'stock', {
                      shouldValidate: true,
                    });
                    setValue('symbol', '', { shouldValidate: true });
                  }
                }}
                onQueryChange={handleAssetQueryChange}
                loading={isAssetSearchLoading}
                minChars={2}
                debounceMs={300}
                inputClassName="mt-1"
              />
            )}
          />
          <Text as="div" size="sm" tone="muted" className="mt-1">
            Results include stocks and crypto. Pick one to continue.
          </Text>
          {errors.assetSelection ? (
            <Text as="div" size="sm" className="mt-1 text-red-600">
              {errors.assetSelection.message}
            </Text>
          ) : null}
          {isDuplicateAsset ? (
            <Text as="div" size="sm" className="mt-1 text-amber-600">
              This asset is already in your watchlist.
            </Text>
          ) : null}
        </div>

        <input type="hidden" {...register('assetType')} />
        <input type="hidden" {...register('symbol')} />
      </form>
    </Modal>
  );
}
