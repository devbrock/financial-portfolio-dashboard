import { z } from 'zod';

export const holdingSchema = z.object({
  id: z.string().optional(),
  symbol: z.string().min(1),
  assetType: z.enum(['stock', 'crypto']),
  quantity: z.number().positive(),
  purchasePrice: z.number().positive(),
  purchaseDate: z.string().refine(value => !Number.isNaN(Date.parse(value))),
  notes: z.string().optional(),
});

export type HoldingSchema = z.infer<typeof holdingSchema>;
