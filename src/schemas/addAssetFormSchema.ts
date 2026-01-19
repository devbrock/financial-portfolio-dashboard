import { z } from 'zod';

const purchaseDateSchema = z
  .string()
  .refine(value => !Number.isNaN(Date.parse(value)), {
    message: 'Purchase date is required',
  })
  .superRefine((value, ctx) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsed > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Purchase date cannot be in the future',
      });
    }
  });

export const addAssetFormSchema = z.object({
  assetSelection: z.string().min(1, 'Select an asset from search'),
  assetType: z.enum(['stock', 'crypto']),
  symbol: z.string().min(1, 'Select an asset from search'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  purchasePrice: z.number().positive('Purchase price must be greater than 0'),
  purchaseDate: purchaseDateSchema,
});
