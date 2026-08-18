import { z } from 'zod'

// Shared
import { optionalText } from '#/shared/utils/optional-text'

export const departmentFormSchema = z.object({
  name: z
    .string({ message: 'form.errors.name-required' })
    .min(1, { message: 'form.errors.name-required' })
    .max(100, { message: 'form.errors.name-max' }),
  parkingSpace: z
    .number({ message: 'form.errors.parking-space-required' })
    .int({ message: 'form.errors.parking-space-integer' })
    .min(0, { message: 'form.errors.parking-space-min' }),
  description: optionalText(z.string({ message: 'form.errors.description-max' }).max(2000)),
  isActive: z.boolean(),
})

/** Tipo inferido do schema de formulário de departamento. */
export type DepartmentFormValues = z.infer<typeof departmentFormSchema>
