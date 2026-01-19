import { z } from 'zod';

export const watchlistFormSchema = z.object({
  assetSelection: z.string().min(1, 'Select an asset from search'),
  assetType: z.enum(['stock', 'crypto']),
  symbol: z.string().min(1, 'Select an asset from search'),
});
