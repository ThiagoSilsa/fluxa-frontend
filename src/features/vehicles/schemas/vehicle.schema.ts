import { z } from 'zod'

// Utils
import { isValidBrazilianPlate } from '../utils/plate'

// Shared
import { optionalText } from '#/shared/utils/optional-text'

export const vehicleFormSchema = z
  .object({
    plate: z
      .string({ message: 'form.errors.plate-required' })
      .min(1, { message: 'form.errors.plate-required' })
      .max(10, { message: 'form.errors.plate-max' }),
    vehicleTypeId: z
      .string({ message: 'form.errors.type-required' })
      .min(1, { message: 'form.errors.type-required' }),
    model: optionalText(z.string({ message: 'form.errors.model-max' }).max(100)),
    color: optionalText(z.string({ message: 'form.errors.color-max' }).max(50)),
    observation: optionalText(z.string({ message: 'form.errors.observation-max' }).max(2000)),
    departmentId: z.string().optional(),
    freePass: z.boolean(),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    // Formato brasileiro (antigo/Mercosul) após normalizar a placa — espelho
    // do backend (ADR 0006 §3).
    if (!isValidBrazilianPlate(values.plate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['plate'],
        message: 'form.errors.plate-invalid',
      })
    }
  })

/** Tipo inferido do schema de formulário de veículo. */
export type VehicleFormValues = z.infer<typeof vehicleFormSchema>
