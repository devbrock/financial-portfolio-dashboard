import { z } from 'zod';
import { addAssetFormSchema } from '@/schemas/addAssetFormSchema';

export type AddAssetFormValues = z.infer<typeof addAssetFormSchema>;
