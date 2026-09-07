import { z } from 'zod'

// Utils
import { isValidBrazilianPlate } from '../utils/plate'

/**
 * Formulário de bloqueio/solicitação de bloqueio (placa + motivo).
 *
 * Compartilhado pela criação de `vehicle_block` (MANAGE_BLOCKS) e de
 * `block_request` (porteiro — CREATE_BLOCK_REQUEST), já que ambos enviam
 * placa + motivo.
 */
export const blockFormSchema = z
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

/** Tipo inferido do formulário de bloqueio. */
export type BlockFormValues = z.infer<typeof blockFormSchema>

/**
 * Formulário de revogação (motivo obrigatório).
 */
export const revokeBlockSchema = z.object({
  reason: z
    .string({ message: 'form.errors.reason-required' })
    .min(1, { message: 'form.errors.reason-required' })
    .max(2000, { message: 'form.errors.reason-max' }),
})

/** Tipo inferido do formulário de revogação. */
export type RevokeBlockValues = z.infer<typeof revokeBlockSchema>
