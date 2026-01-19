import { useCallback, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Combobox, Inline, Input, Modal, Text } from '@components';
import type { ComboboxItem } from '@components';
import { useSymbolSearch } from '@/hooks/useSymbolSearch';
import { useCryptoSearch } from '@/hooks/useCryptoSearch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addHolding } from '@/features/portfolio/portfolioSlice';
import type { AssetType, Holding } from '@/types/portfolio';
import { toast } from 'sonner';

const addAssetSchema = z.object({
  assetSelection: z.string().min(1, 'Select an asset from search'),
  assetType: z.enum(['stock', 'crypto']),
  symbol: z.string().min(1, 'Select an asset from search'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  purchasePrice: z.number().positive('Purchase price must be greater than 0'),
  purchaseDate: z.string().refine(value => !Number.isNaN(Date.parse(value)), {
    message: 'Purchase date is required',
  }),
});

type AddAssetFormValues = z.infer<typeof addAssetSchema>;

type AddAssetModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: (holding: Holding) => void;
};

function generateHoldingId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AddAssetModal(props: AddAssetModalProps) {
  const { open, onOpenChange, onAdded } = props;
  const dispatch = useAppDispatch();
  const holdings = useAppSelector(state => state.portfolio.holdings);
  const [assetQuery, setAssetQuery] = useState('');
  const [selectedAssetLabel, setSelectedAssetLabel] = useState('');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    control,
  } = useForm<AddAssetFormValues>({
    resolver: zodResolver(addAssetSchema),
    defaultValues: {
      assetSelection: '',
      assetType: 'stock',
      symbol: '',
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: today,
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
    return holdings.some(
      holding =>
        holding.assetType === selectedAssetType &&
        holding.symbol.toLowerCase() === selectedSymbol.toLowerCase()
    );
  }, [holdings, selectedAssetType, selectedSymbol]);

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
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: today,
    });
  }, [reset, today]);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetForm();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm]
  );

  const onSubmitAddAsset = useCallback(
    (values: AddAssetFormValues) => {
      const assetType = values.assetType as AssetType;
      const normalizedSymbol =
        assetType === 'stock'
          ? values.symbol.trim().toUpperCase()
          : values.symbol.trim().toLowerCase();

      const holding: Holding = {
        id: generateHoldingId(),
        symbol: normalizedSymbol,
        assetType,
        quantity: values.quantity,
        purchasePrice: values.purchasePrice,
        purchaseDate: values.purchaseDate,
      };

      dispatch(addHolding(holding));
      toast.success('Asset added to your portfolio.');
      onAdded?.(holding);
      resetForm();
      onOpenChange(false);
    },
    [dispatch, onAdded, onOpenChange, resetForm]
  );

  const handleInvalid = useCallback(() => {
    toast.error('Please correct the form errors and try again.');
  }, []);

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      title="Add asset"
      description="Record a new position to update your portfolio totals."
      footer={
        <>
          <Button variant="secondary" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="add-asset-form" disabled={isSubmitting}>
            Add Asset
          </Button>
        </>
      }
    >
      <form
        id="add-asset-form"
        onSubmit={handleSubmit(onSubmitAddAsset, handleInvalid)}
        className="space-y-3"
      >
        <div>
          <Text as="label" htmlFor="assetSearch" size="sm">
            Search asset
          </Text>
          <Controller
            control={control}
            name="assetSelection"
            render={({ field }) => (
              <Combobox
                id="assetSearch"
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
              You already have this asset in your portfolio.
            </Text>
          ) : null}
        </div>

        <input type="hidden" {...register('assetType')} />
        <input type="hidden" {...register('symbol')} />

        <Inline align="start" className="gap-3">
          <div className="w-full">
            <Text as="label" htmlFor="quantity" size="sm">
              Quantity
            </Text>
            <Input
              id="quantity"
              type="number"
              step="any"
              className="mt-1"
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity ? (
              <Text as="div" size="sm" className="mt-1 text-red-600">
                {errors.quantity.message}
              </Text>
            ) : null}
          </div>
          <div className="w-full">
            <Text as="label" htmlFor="purchasePrice" size="sm">
              Purchase price (USD)
            </Text>
            <Input
              id="purchasePrice"
              type="number"
              step="any"
              className="mt-1"
              {...register('purchasePrice', { valueAsNumber: true })}
            />
            {errors.purchasePrice ? (
              <Text as="div" size="sm" className="mt-1 text-red-600">
                {errors.purchasePrice.message}
              </Text>
            ) : null}
          </div>
        </Inline>

        <div>
          <Text as="label" htmlFor="purchaseDate" size="sm">
            Purchase date
          </Text>
          <Input id="purchaseDate" type="date" className="mt-1" {...register('purchaseDate')} />
          {errors.purchaseDate ? (
            <Text as="div" size="sm" className="mt-1 text-red-600">
              {errors.purchaseDate.message}
            </Text>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
