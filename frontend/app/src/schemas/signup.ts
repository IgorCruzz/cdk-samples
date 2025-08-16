import { z } from 'zod';

export const signUpSchema = z
  .object({
    firstName: z.string().min(1, 'Nome é obrigatório'),
    lastName: z.string().min(1, 'Sobrenome é obrigatório'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type signUpInput = z.infer<typeof signUpSchema>;
