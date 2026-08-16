import { z } from 'zod'

// Shared
import { optionalText } from '#/shared/utils/optional-text'

// Types
import { USER_TYPES } from '../types/users.types'

/** E-mail válido (mensagens de erro = chaves i18n do namespace `users`). */
const emailField = z
  .string({ message: 'form.errors.email-required' })
  .email('form.errors.email-invalid')
  .max(255, 'form.errors.email-max')

/** Tipo no vínculo (EMPLOYEE/VISITOR). */
const typeField = z.enum(USER_TYPES, { message: 'form.errors.type-invalid' }).default('EMPLOYEE')

/** Cargo a vincular (obrigatório na criação/vínculo). */
const roleIdRequiredField = z
  .string({ message: 'form.errors.roleId-required' })
  .min(1, { message: 'form.errors.roleId-required' })

/** Base compartilhada entre criação e edição. */
const userFormBaseSchema = z.object({
  name: z
    .string({ message: 'form.errors.name-required' })
    .min(2, { message: 'form.errors.name-min' })
    .max(255, { message: 'form.errors.name-max' }),
  email: emailField,
  /** Vazio = não alterar (edição); obrigatória na criação. */
  password: z.string().optional(),
  phone: optionalText(z.string({ message: 'form.errors.phone-max' }).max(32)),
  document: optionalText(z.string({ message: 'form.errors.document-max' }).max(32)),
  observation: optionalText(z.string({ message: 'form.errors.observation-max' }).max(2000)),
  type: typeField,
  isActive: z.boolean(),
  /** '' = sem cargo (edição). */
  roleId: z.string().optional(),
})

/**
 * Schema de criação de usuário (pessoa nova).
 *
 * Nome, e-mail, senha (6–128) e cargo obrigatórios. Dados da pessoa são
 * enviados junto com o vínculo (ADR 0005 §2).
 */
export const userCreateFormSchema = userFormBaseSchema
  .omit({ password: true, roleId: true })
  .extend({
    password: z
      .string({ message: 'form.errors.password-required' })
      .min(6, { message: 'form.errors.password-min' })
      .max(128, { message: 'form.errors.password-max' }),
    roleId: roleIdRequiredField,
    isActive: z.boolean().default(true),
  })

/**
 * Schema de vínculo de pessoa já existente (modo "vincular").
 *
 * Só e-mail, tipo e cargo — dados da pessoa e senha são proibidos pelo
 * backend (400) quando a pessoa já existe em outra empresa.
 */
export const userLinkFormSchema = z.object({
  email: emailField,
  type: typeField,
  roleId: roleIdRequiredField,
})

/**
 * Schema de edição de usuário (parcial).
 *
 * Senha e cargo opcionais ('' = sem cargo); `isActive` editável no vínculo.
 */
export const userEditFormSchema = userFormBaseSchema

/** Tipo inferido do formulário de usuário (união de todos os campos). */
export type UserFormValues = z.infer<typeof userCreateFormSchema>
