import { z } from "zod";

export const confirmSchema = z.object({ 
  code: z.string().min(6).max(6),
});

export type confirmInput = z.infer<typeof confirmSchema>;