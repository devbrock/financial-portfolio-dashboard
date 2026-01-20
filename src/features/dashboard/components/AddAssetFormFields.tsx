import { Controller, useFormContext } from 'react-hook-form';
import { Combobox, Inline, Input, Text } from '@components';
import type { ComboboxItem } from '@components';
import type { AddAssetFormValues } from './AddAssetForm.types';

type AddAssetFormFieldsProps = {
  assetOptions: ComboboxItem[];
  isAssetSearchLoading: boolean;
  onAssetQueryChange: (nextQuery: string) => void;
  onAssetLabelChange: (label: string) => void;
  isDuplicateAsset: boolean;
};

export function AddAssetFormFields(props: AddAssetFormFieldsProps) {
  const { assetOptions, isAssetSearchLoading, onAssetQueryChange, onAssetLabelChange, isDuplicateAsset } =
    props;
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<AddAssetFormValues>();

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
              inputTransform={value => value.toUpperCase()}
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
    </>
  );
}
