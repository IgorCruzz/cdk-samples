import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido"),
  email: z.string().email("E-mail inválido"),
  phone: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, "Telefone inválido"),
  address: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve conter 2 letras (UF)").toUpperCase(),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido"),
});

export type CustomerType = z.infer<typeof customerSchema>;
