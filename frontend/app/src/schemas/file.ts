import { z } from 'zod';

export const fileSchema = z.object({
  file: z.custom<File>(
    (file) => {
      if (!(file instanceof File)) return false;
      if (file.size === 0) return false;
      if (!['text/csv'].includes(file.type)) return false;
      return true;
    },
    {
      message: 'You must upload a valid CSV file.',
    },
  ),
});

export type fileType = z.infer<typeof fileSchema>;
