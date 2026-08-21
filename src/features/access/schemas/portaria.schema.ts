import { z } from 'zod'

// Utils
import { isValidBrazilianPlate } from '../utils/plate'

// Shared
import { optionalText } from '#/shared/utils/optional-text'

/**
 * UUID aceitando qualquer nibble de versão (0–8) — espelho do backend
 * (`UUID_ANY_VERSION_PATTERN`). Os IDs seedados usam nibble `0` (válido para
 * o Postgres uuid, mas rejeitado por `z.uuid()`).
 */
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Formulário de entrada da portaria.
 *
 * Placa obrigatória (formato BR validado após normalização). Opcionais:
 * id da solicitação autorizada (`access_request`) e nome do condutor
 * temporário — usados na entrada com autorização (ADR 0010 §4).
 */
export const entryFormSchema = z
  .object({
    plate: z
      .string({ message: 'form.entry.errors.plate-required' })
      .min(1, { message: 'form.entry.errors.plate-required' })
      .max(10, { message: 'form.entry.errors.plate-max' }),
    accessRequestId: z
      .string()
      .refine((value) => value === '' || uuidPattern.test(value), {
        message: 'form.entry.errors.access-request-invalid',
      })
      .optional(),
    temporaryDriverName: optionalText(z.string().max(255)),
  })
  .superRefine((values, ctx) => {
    if (!isValidBrazilianPlate(values.plate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['plate'],
        message: 'form.entry.errors.plate-invalid',
      })
    }
  })

/**
 * Formulário de saída da portaria.
 *
 * Placa obrigatória. Passageiro opcional — exigido pelo backend quando não há
 * entrada registrada (NO_EXIT — regra 11) e o veículo não é `free_pass`.
 */
export const exitFormSchema = z
  .object({
    plate: z
      .string({ message: 'form.exit.errors.plate-required' })
      .min(1, { message: 'form.exit.errors.plate-required' })
      .max(10, { message: 'form.exit.errors.plate-max' }),
    temporaryDriverName: optionalText(z.string().max(255)),
  })
  .superRefine((values, ctx) => {
    if (!isValidBrazilianPlate(values.plate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['plate'],
        message: 'form.exit.errors.plate-invalid',
      })
    }
  })

/** Tipo inferido do formulário de entrada. */
export type EntryFormValues = z.infer<typeof entryFormSchema>

/** Tipo inferido do formulário de saída. */
export type ExitFormValues = z.infer<typeof exitFormSchema>
