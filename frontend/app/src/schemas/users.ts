import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email().trim(),
  name: z.string().min(1).trim(),
});

export type UserInput = z.infer<typeof userSchema>;