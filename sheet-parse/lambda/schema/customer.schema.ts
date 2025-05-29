import { z } from "zod";

const schema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  company: z.string(),
  city: z.string(),
  country: z.string(),
  phone1: z.string(),
  phone2: z.string().optional(),
  email: z.string().email(),
  website: z.string().url().optional(),
});

export type Customer = z.infer<typeof schema>;
