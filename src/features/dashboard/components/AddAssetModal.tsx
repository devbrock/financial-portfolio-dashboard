import { useCallback, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal } from '@components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addHolding, removeHolding } from '@/features/portfolio/portfolioSlice';
import type { AssetType, Holding } from '@/types/portfolio';
import { toast } from 'sonner';
import { addAssetFormSchema } from '@/schemas/addAssetFormSchema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addHoldingToPortfolio } from '@/services/api/functions/portfolioApi';
import { AddAssetFormFields } from './AddAssetFormFields';
import type { AddAssetFormValues } from './AddAssetForm.types';
import { useAssetSearchOptions } from './useAssetSearchOptions';

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
  const queryClient = useQueryClient();

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const form = useForm<AddAssetFormValues>({
    resolver: zodResolver(addAssetFormSchema),
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
    control: form.control,
    name: 'assetSelection',
  });
  const selectedSymbol = useWatch({
    control: form.control,
    name: 'symbol',
  });
  const selectedAssetType = useWatch({
    control: form.control,
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

  const {
    assetOptions,
    isAssetSearchLoading,
    handleAssetQueryChange,
    setSelectedAssetLabel: setAssetLabel,
    resetAssetSearch,
  } = useAssetSearchOptions(selectedAssetValue ?? '');

  const resetForm = useCallback(() => {
    resetAssetSearch();
    form.reset({
      assetSelection: '',
      assetType: 'stock',
      symbol: '',
      quantity: 0,
      purchasePrice: 0,
      purchaseDate: today,
    });
  }, [form, resetAssetSearch, today]);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetForm();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm]
  );

  const addHoldingMutation = useMutation({
    mutationFn: addHoldingToPortfolio,
    onMutate: async (newHolding: Holding) => {
      dispatch(addHolding(newHolding));
      return { holding: newHolding };
    },
    onError: (_error, newHolding) => {
      dispatch(removeHolding(newHolding.id));
      toast.error('Failed to add the asset. Please try again.');
    },
    onSuccess: holding => {
      toast.success('Asset added to your portfolio.');
      onAdded?.(holding);
      resetForm();
      onOpenChange(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

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

      addHoldingMutation.mutate(holding);
    },
    [addHoldingMutation]
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
          <Button
            variant="primary"
            type="submit"
            form="add-asset-form"
            disabled={form.formState.isSubmitting || addHoldingMutation.isPending || isDuplicateAsset}
          >
            Add Asset
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <form
          id="add-asset-form"
          onSubmit={form.handleSubmit(onSubmitAddAsset, handleInvalid)}
          className="space-y-3"
        >
          <AddAssetFormFields
            assetOptions={assetOptions}
            isAssetSearchLoading={isAssetSearchLoading}
            onAssetQueryChange={handleAssetQueryChange}
            onAssetLabelChange={setAssetLabel}
            isDuplicateAsset={isDuplicateAsset}
          />
        </form>
      </FormProvider>
    </Modal>
  );
}
