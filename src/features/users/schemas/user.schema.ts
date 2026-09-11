import { z } from 'zod'

// Shared
import { optionalText } from '#/shared/utils/optional-text'

// Types
import { USER_TYPES } from '../types/users.types'
/** Validador de e-mail (mensagem = chave i18n do namespace `users`). */
const emailValidator = z.string().email('form.errors.email-invalid')

/**
 * E-mail (obrigatório para Colaborador/vínculo; opcional para Visitante —
 * ADR 0013). Vazio é aceito pelo schema; o `superRefine` de cada schema cobra
 * a obrigatoriedade conforme o tipo.
 */
const emailField = z
  .string()
  .max(255, { message: 'form.errors.email-max' })
  .refine((value) => value === '' || emailValidator.safeParse(value).success, {
    message: 'form.errors.email-invalid',
  })
  .optional()

/** Tipo no vínculo (EMPLOYEE/VISITOR). */
const typeField = z.enum(USER_TYPES, { message: 'form.errors.type-invalid' }).default('EMPLOYEE')

/**
 * Senha opcional ('' = não definir/não alterar) — quando preenchida, 6–128
 * caracteres (mesmas regras do backend).
 */
const optionalPasswordField = z
  .string()
  .refine((value) => value === '' || value.length >= 6, {
    message: 'form.errors.password-min',
  })
  .refine((value) => value === '' || value.length <= 128, {
    message: 'form.errors.password-max',
  })
  .optional()

/** Diz se o tipo exige credenciais de acesso (Colaborador — ADR 0013). */
function requiresCredentials(type: string): boolean {
  return type === 'EMPLOYEE'
}

/** Base compartilhada entre criação e edição. */
const userFormBaseSchema = z.object({
  name: z
    .string({ message: 'form.errors.name-required' })
    .min(2, { message: 'form.errors.name-min' })
    .max(255, { message: 'form.errors.name-max' }),
  email: emailField,
  /** Vazio = não alterar (edição); obrigatória para Colaborador. */
  password: optionalPasswordField,
  phone: optionalText(z.string({ message: 'form.errors.phone-max' }).max(32)),
  document: optionalText(z.string({ message: 'form.errors.document-max' }).max(32)),
  type: typeField,
  isActive: z.boolean(),
  /** '' = sem cargo (Visitante/edição, "Sem cargo"). */
  roleId: z.string().optional(),
})

/**
 * Schema de criação de usuário (pessoa nova).
 *
 * Nome sempre obrigatório. Para **Colaborador**, e-mail, senha (6–128) e cargo
 * são obrigatórios (acesso ao sistema); para **Visitante** nenhum dos três é
 * exigido (ADR 0013). Dados da pessoa são enviados junto com o vínculo
 * (ADR 0005 §2).
 */
export const userCreateFormSchema = userFormBaseSchema
  .extend({ isActive: z.boolean().default(true) })
  .superRefine((values, ctx) => {
    if (!requiresCredentials(values.type)) {
      return
    }

    if (!values.email?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'form.errors.email-required' })
    }
    if (!values.password?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'form.errors.password-required',
      })
    }
    if (!values.roleId?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['roleId'],
        message: 'form.errors.roleId-required',
      })
    }
  })

/**
 * Schema de vínculo de pessoa já existente (modo "vincular").
 *
 * O e-mail é sempre obrigatório (é a chave que localiza a pessoa) e o cargo
 * só é exigido para **Colaborador** — Visitante não tem cargo (ADR 0013).
 * Dados da pessoa e senha são proibidos pelo backend (400) quando a pessoa já
 * existe em outra empresa.
 */
export const userLinkFormSchema = z
  .object({
    email: emailField,
    type: typeField,
    roleId: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.email?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'form.errors.email-required' })
    }
    if (requiresCredentials(values.type) && !values.roleId?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['roleId'],
        message: 'form.errors.roleId-required',
      })
    }
  })

/**
 * Schema de edição de usuário (parcial), conforme o tipo atual do vínculo.
 *
 * `isActive` editável; cargo e senha opcionais ('' = "Sem cargo" / manter a
 * senha atual) nas edições comuns. Quando a edição **promove** Visitante →
 * Colaborador, passam a ser obrigatórios e-mail, cargo e senha — a senha é
 * definida pelo fluxo de troca de senha (ADR 0013).
 *
 * @param originalType Tipo do vínculo antes da edição (detecta a promoção).
 */
export function buildUserEditFormSchema(originalType: (typeof USER_TYPES)[number]) {
  return userFormBaseSchema.superRefine((values, ctx) => {
    if (!requiresCredentials(values.type)) {
      return
    }

    if (!values.email?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'form.errors.email-required' })
    }

    // Edição de um Colaborador já existente: senha em branco mantém a atual.
    if (originalType === 'EMPLOYEE') {
      return
    }

    // Promoção Visitante → Colaborador: exige cargo e senha.
    if (!values.roleId?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['roleId'],
        message: 'form.errors.roleId-required',
      })
    }
    if (!values.password?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'form.errors.password-required',
      })
    }
  })
}

/** Tipo inferido do formulário de usuário (união de todos os campos). */
export type UserFormValues = z.infer<typeof userCreateFormSchema>
