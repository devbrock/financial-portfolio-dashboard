import { Controller, useFormContext } from 'react-hook-form';
import { Combobox, Text } from '@components';
import type { ComboboxItem } from '@components';
import type { WatchlistFormValues } from './AddWatchlistForm.types';

type AddWatchlistFormFieldsProps = {
  assetOptions: ComboboxItem[];
  isAssetSearchLoading: boolean;
  onAssetQueryChange: (nextQuery: string) => void;
  onAssetLabelChange: (label: string) => void;
  isDuplicateAsset: boolean;
};

export function AddWatchlistFormFields(props: AddWatchlistFormFieldsProps) {
  const {
    assetOptions,
    isAssetSearchLoading,
    onAssetQueryChange,
    onAssetLabelChange,
    isDuplicateAsset,
  } = props;
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<WatchlistFormValues>();
  const watchlistSearchHelpId = 'watchlist-search-help';
  const watchlistSearchErrorId = 'watchlist-search-error';
  const watchlistSearchDuplicateId = 'watchlist-search-duplicate';
  const hasAssetSelectionError = Boolean(errors.assetSelection);
  const watchlistSearchDescribedBy = [
    watchlistSearchHelpId,
    hasAssetSelectionError ? watchlistSearchErrorId : null,
    isDuplicateAsset ? watchlistSearchDuplicateId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <>
      <div className='space-y-2! mt-2!'>
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
                onAssetLabelChange(selectedItem?.label ?? '');
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
                  onAssetLabelChange('');
                  setValue('assetType', 'stock', {
                    shouldValidate: true,
                  });
                  setValue('symbol', '', { shouldValidate: true });
                }
              }}
              onQueryChange={onAssetQueryChange}
              loading={isAssetSearchLoading}
              minChars={2}
              debounceMs={300}
              inputClassName="mt-1"
              aria-describedby={watchlistSearchDescribedBy}
              aria-invalid={hasAssetSelectionError || isDuplicateAsset || undefined}
            />
          )}
        />
        <Text as="div" id={watchlistSearchHelpId} size="sm" tone="muted" className="mt-1">
          Results include stocks and crypto. Pick one to continue.
        </Text>
        {errors.assetSelection ? (
          <Text
            as="div"
            id={watchlistSearchErrorId}
            role="alert"
            size="sm"
            className="mt-1 text-red-600"
          >
            {errors.assetSelection.message}
          </Text>
        ) : null}
        {isDuplicateAsset ? (
          <Text
            as="div"
            id={watchlistSearchDuplicateId}
            role="status"
            size="sm"
            className="mt-1 text-amber-600"
          >
            This asset is already in your watchlist.
          </Text>
        ) : null}
      </div>

      <input type="hidden" {...register('assetType')} />
      <input type="hidden" {...register('symbol')} />
    </>
  );
}
