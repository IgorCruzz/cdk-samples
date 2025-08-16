import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).trim(),
});

export type AuthInput = z.infer<typeof authSchema>;
