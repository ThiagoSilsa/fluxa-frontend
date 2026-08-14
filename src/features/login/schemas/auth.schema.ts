import { z } from 'zod'

/**
 * Schema de validação do formulário de login.
 *
 * As mensagens são chaves de tradução do namespace `login`, resolvidas pelo
 * i18n na hora de exibir (`t(errors.email.message)`).
 */
export const loginSchema = z.object({
  email: z.email({ message: 'form.errors.invalid-email' }),
  password: z.string().min(1, 'form.errors.invalid-password'),
})

export type LoginSchema = z.infer<typeof loginSchema>
