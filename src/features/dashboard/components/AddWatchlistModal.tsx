import { useCallback, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal } from '@components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addWatchlistItem, removeWatchlistItem } from '@/features/portfolio/portfolioSlice';
import type { AssetType, WatchlistItem } from '@/types/portfolio';
import { toast } from 'sonner';
import { watchlistFormSchema } from '@/schemas/watchlistFormSchema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addWatchlistItemToPortfolio } from '@/services/api/functions/portfolioApi';
import { AddWatchlistFormFields } from './AddWatchlistFormFields';
import type { WatchlistFormValues } from './AddWatchlistForm.types';
import { useAssetSearchOptions } from './useAssetSearchOptions';

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
  const queryClient = useQueryClient();

  const form = useForm<WatchlistFormValues>({
    resolver: zodResolver(watchlistFormSchema),
    defaultValues: {
      assetSelection: '',
      assetType: 'stock',
      symbol: '',
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
    return watchlist.some(
      item =>
        item.assetType === selectedAssetType &&
        item.symbol.toLowerCase() === selectedSymbol.toLowerCase()
    );
  }, [selectedAssetType, selectedSymbol, watchlist]);

  const {
    assetOptions,
    isAssetSearchLoading,
    handleAssetQueryChange,
    setSelectedAssetLabel,
    resetAssetSearch,
  } = useAssetSearchOptions(selectedAssetValue ?? '');

  const resetForm = useCallback(() => {
    resetAssetSearch();
    form.reset({
      assetSelection: '',
      assetType: 'stock',
      symbol: '',
    });
  }, [form, resetAssetSearch]);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetForm();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm]
  );

  const addWatchlistMutation = useMutation({
    mutationFn: addWatchlistItemToPortfolio,
    onMutate: async (newItem: WatchlistItem) => {
      dispatch(addWatchlistItem(newItem));
      return { item: newItem };
    },
    onError: (_error, newItem) => {
      dispatch(removeWatchlistItem(newItem.id));
      toast.error('Failed to add to your watchlist. Please try again.');
    },
    onSuccess: () => {
      toast.success('Added to watchlist.');
      resetForm();
      onOpenChange(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

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

      addWatchlistMutation.mutate(watchlistItem);
    },
    [addWatchlistMutation]
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
        <span className="mt-4! space-x-4!">
          <Button variant="secondary" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="add-watchlist-form"
            disabled={
              form.formState.isSubmitting || addWatchlistMutation.isPending || isDuplicateAsset
            }
          >
            Add to Watchlist
          </Button>
        </span>
      }
    >
      <FormProvider {...form}>
        <form
          id="add-watchlist-form"
          onSubmit={form.handleSubmit(onSubmitAddWatchlist, handleInvalid)}
          className="space-y-3"
        >
          <AddWatchlistFormFields
            assetOptions={assetOptions}
            isAssetSearchLoading={isAssetSearchLoading}
            onAssetQueryChange={handleAssetQueryChange}
            onAssetLabelChange={setSelectedAssetLabel}
            isDuplicateAsset={isDuplicateAsset}
          />
        </form>
      </FormProvider>
    </Modal>
  );
}
