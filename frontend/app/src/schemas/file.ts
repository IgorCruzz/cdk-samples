import { z } from 'zod'

export const fileSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, { message: "Arquivo obrigatório." })
    .refine((file) => file?.size > 0, { message: "Arquivo vazio." })
    .refine((file) => ['text/csv'].includes(file?.type), { message: "Você deve enviar um arquivo CSV válido." })
});

export type fileType = z.infer<typeof fileSchema>