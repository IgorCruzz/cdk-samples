import { z } from 'zod';

export const fileSchema = z
  .object({
    endpoint: z
      .string()
      .min(1, { message: 'Endpoint is required.' })
      .regex(/^[a-zA-Z0-9-]+$/, {
        message: 'Endpoint must only contain letters, numbers, and hyphens (no slashes or special characters).',
      })
      .toLowerCase()
      .trim(),
    file: z.custom<File>(
      (file) => {
        if (!(file instanceof File)) return false;
        if (file.size === 0) return false;
        if (!['text/csv'].includes(file.type)) return false;
        return true;
      },
      { message: 'You must upload a valid CSV file.' },
    ),
  })
  .strip();
