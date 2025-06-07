import { z } from "zod";

export const CustomerSchema = z.object({
  firstName: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),

  lastName: z
    .string()
    .min(2, "O sobrenome deve ter pelo menos 2 caracteres")
    .max(50, "O sobrenome deve ter no máximo 50 caracteres"),

  company: z
    .string()
    .min(1, "A empresa é obrigatória")
    .max(100, "O nome da empresa deve ter no máximo 100 caracteres"),

  city: z
    .string()
    .min(1, "A cidade é obrigatória")
    .max(100, "O nome da cidade deve ter no máximo 100 caracteres"),

  country: z
    .string()
    .min(1, "O país é obrigatório")
    .max(100, "O nome do país deve ter no máximo 100 caracteres"),

  phone1: z.string(),

  phone2: z.string().optional().or(z.literal("")),

  email: z.string().email("E-mail inválido"),

  website: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type CustomerType = z.infer<typeof CustomerSchema>;
