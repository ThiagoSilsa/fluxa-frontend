import { z } from 'zod'

// Utils
import { isValidBrazilianPlate } from '../utils/plate'

/**
 * Formulário do cenário "Bloqueio" da solicitação (placa + motivo).
 *
 * Local da feature de solicitações (sem importar a feature de bloqueios —
 * regra de arquitetura). Envia `POST /block-requests`; usa os campos
 * compartilhados `PlateReasonFields`.
 */
export const blockRequestFormSchema = z
  .object({
    plate: z
      .string({ message: 'form.errors.plate-required' })
      .min(1, { message: 'form.errors.plate-required' })
      .max(10, { message: 'form.errors.plate-max' }),
    reason: z
      .string({ message: 'form.errors.reason-required' })
      .min(1, { message: 'form.errors.reason-required' })
      .max(2000, { message: 'form.errors.reason-max' }),
  })
  .superRefine((values, ctx) => {
    if (!isValidBrazilianPlate(values.plate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['plate'],
        message: 'form.errors.plate-invalid',
      })
    }
  })

/** Tipo inferido do formulário do cenário "Bloqueio". */
export type BlockRequestFormValues = z.infer<typeof blockRequestFormSchema>
