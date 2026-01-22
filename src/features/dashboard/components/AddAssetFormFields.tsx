import { Controller, useFormContext } from 'react-hook-form';
import { Combobox, Text } from '@components';
import type { ComboboxItem } from '@components';
import type { AddAssetFormValues } from './AddAssetForm.types';
import { PurchaseDetailsFields } from './PurchaseDetailsFields';

type AddAssetFormFieldsProps = {
  assetOptions: ComboboxItem[];
  isAssetSearchLoading: boolean;
  onAssetQueryChange: (nextQuery: string) => void;
  onAssetLabelChange: (label: string) => void;
  isDuplicateAsset: boolean;
};

/**
 * Renders all form fields for the add asset modal.
 */
export function AddAssetFormFields(props: AddAssetFormFieldsProps) {
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
  } = useFormContext<AddAssetFormValues>();

  const assetSearchHelpId = 'asset-search-help';
  const assetSearchErrorId = 'asset-search-error';
  const assetSearchDuplicateId = 'asset-search-duplicate';
  const hasAssetSelectionError = Boolean(errors.assetSelection);
  const assetSearchDescribedBy =
    [
      assetSearchHelpId,
      hasAssetSelectionError ? assetSearchErrorId : null,
      isDuplicateAsset ? assetSearchDuplicateId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <>
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
                onAssetLabelChange(selectedItem?.label ?? '');
                const isStock = nextValue.startsWith('stock:');
                const rawSymbol = nextValue.replace(isStock ? 'stock:' : 'crypto:', '');
                setValue('assetType', isStock ? 'stock' : 'crypto', { shouldValidate: true });
                setValue('symbol', isStock ? rawSymbol.toUpperCase() : rawSymbol.toLowerCase(), {
                  shouldValidate: true,
                });
              }}
              onInputChange={() => {
                if (field.value) {
                  field.onChange('');
                  onAssetLabelChange('');
                  setValue('assetType', 'stock', { shouldValidate: true });
                  setValue('symbol', '', { shouldValidate: true });
                }
              }}
              onQueryChange={onAssetQueryChange}
              inputTransform={value => value.toUpperCase()}
              loading={isAssetSearchLoading}
              minChars={2}
              debounceMs={300}
              inputClassName="mt-1"
              aria-describedby={assetSearchDescribedBy}
              aria-invalid={hasAssetSelectionError || isDuplicateAsset || undefined}
            />
          )}
        />
        <Text as="div" id={assetSearchHelpId} size="sm" tone="muted" className="mt-1">
          Results include stocks and crypto. Pick one to continue.
        </Text>
        {errors.assetSelection ? (
          <Text
            as="div"
            id={assetSearchErrorId}
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
            id={assetSearchDuplicateId}
            role="status"
            size="sm"
            className="mt-1 text-amber-600"
          >
            You already have this asset in your portfolio.
          </Text>
        ) : null}
      </div>

      <input type="hidden" {...register('assetType')} />
      <input type="hidden" {...register('symbol')} />

      <PurchaseDetailsFields />
    </>
  );
}
