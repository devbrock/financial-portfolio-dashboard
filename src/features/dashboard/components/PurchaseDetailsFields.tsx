import { useFormContext } from 'react-hook-form';
import { Inline, Input, Text } from '@components';
import type { AddAssetFormValues } from './AddAssetForm.types';

/**
 * Renders the quantity, purchase price, and purchase date fields for the add asset form.
 */
export function PurchaseDetailsFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AddAssetFormValues>();

  const quantityErrorId = 'quantity-error';
  const purchasePriceErrorId = 'purchase-price-error';
  const purchaseDateErrorId = 'purchase-date-error';

  return (
    <>
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
            aria-describedby={errors.quantity ? quantityErrorId : undefined}
            aria-invalid={errors.quantity ? 'true' : undefined}
            {...register('quantity', { valueAsNumber: true })}
          />
          {errors.quantity ? (
            <Text as="div" id={quantityErrorId} role="alert" size="sm" className="mt-1 text-red-600">
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
            aria-describedby={errors.purchasePrice ? purchasePriceErrorId : undefined}
            aria-invalid={errors.purchasePrice ? 'true' : undefined}
            {...register('purchasePrice', { valueAsNumber: true })}
          />
          {errors.purchasePrice ? (
            <Text as="div" id={purchasePriceErrorId} role="alert" size="sm" className="mt-1 text-red-600">
              {errors.purchasePrice.message}
            </Text>
          ) : null}
        </div>
      </Inline>

      <div>
        <Text as="label" htmlFor="purchaseDate" size="sm">
          Purchase date
        </Text>
        <Input
          id="purchaseDate"
          type="date"
          className="mt-1"
          aria-describedby={errors.purchaseDate ? purchaseDateErrorId : undefined}
          aria-invalid={errors.purchaseDate ? 'true' : undefined}
          {...register('purchaseDate')}
        />
        {errors.purchaseDate ? (
          <Text as="div" id={purchaseDateErrorId} role="alert" size="sm" className="mt-1 text-red-600">
            {errors.purchaseDate.message}
          </Text>
        ) : null}
      </div>
    </>
  );
}

