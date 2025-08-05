import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
});

export type AuthInput = z.infer<typeof authSchema>;