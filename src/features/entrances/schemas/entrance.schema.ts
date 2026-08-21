import { z } from 'zod'

export const entranceFormSchema = z.object({
  name: z
    .string({ message: 'form.errors.name-required' })
    .min(1, { message: 'form.errors.name-required' })
    .max(100, { message: 'form.errors.name-max' }),
  isActive: z.boolean(),
})

/** Tipo inferido do schema de formulário de portaria. */
export type EntranceFormValues = z.infer<typeof entranceFormSchema>
