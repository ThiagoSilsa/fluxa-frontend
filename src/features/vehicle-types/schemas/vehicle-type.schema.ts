import { z } from 'zod'

// Shared
import { optionalText } from '#/shared/utils/optional-text'

/**
 * Schema de validação do formulário de tipo de veículo (criação/edição
 * unificado).
 *
 * - code: obrigatório, 1 a 50 caracteres (normalizado uppercase/trim no mapper)
 * - name: obrigatório, 1 a 100 caracteres
 * - description: opcional, máximo 2000 caracteres (vazio aceito como "ausente")
 * - isFleet: classificação de frota (Switch)
 * - isActive: status ativo/inativo (na criação nasce `true`; na edição é
 *   alterável via Switch)
 *
 * As mensagens de erro são chaves i18n do namespace `vehicleTypes` (sem
 * prefixo), resolvidas no componente via `t(errors.field.message)`.
 */
export const vehicleTypeFormSchema = z.object({
  code: z
    .string({ message: 'form.errors.code-required' })
    .min(1, { message: 'form.errors.code-required' })
    .max(50, { message: 'form.errors.code-max' }),
  name: z
    .string({ message: 'form.errors.name-required' })
    .min(1, { message: 'form.errors.name-required' })
    .max(100, { message: 'form.errors.name-max' }),
  description: optionalText(z.string({ message: 'form.errors.description-max' }).max(2000)),
  isFleet: z.boolean(),
  isActive: z.boolean(),
})

/** Tipo inferido do schema de formulário de tipo de veículo. */
export type VehicleTypeFormValues = z.infer<typeof vehicleTypeFormSchema>
