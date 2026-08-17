import { z } from 'zod'

// Shared
import { optionalText } from '#/shared/utils/optional-text'

/**
 * Schema de validação do formulário de cargo (criação/edição unificado).
 *
 * - name: obrigatório, 2 a 255 caracteres
 * - description: opcional, máximo 500 caracteres (vazio aceito como "ausente")
 * - isActive: status ativo/inativo (na criação nasce `true`; na edição é
 *   alterável via Switch)
 *
 * As mensagens de erro são chaves i18n do namespace `roles` (sem prefixo),
 * resolvidas no componente via `t(errors.field.message)`.
 */
export const roleFormSchema = z.object({
  name: z
    .string({ message: 'form.errors.name-required' })
    .min(2, { message: 'form.errors.name-min' })
    .max(255, { message: 'form.errors.name-max' }),
  description: optionalText(z.string({ message: 'form.errors.description-max' }).max(500)),
  isActive: z.boolean(),
})

/** Tipo inferido do schema de formulário de cargo. */
export type RoleFormValues = z.infer<typeof roleFormSchema>
