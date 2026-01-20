import { z } from 'zod';
import { watchlistFormSchema } from '@/schemas/watchlistFormSchema';

export type WatchlistFormValues = z.infer<typeof watchlistFormSchema>;
