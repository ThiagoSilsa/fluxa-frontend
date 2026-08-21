// Lib
import type { RulesEntry } from '../../../lib/build-rules-rows.lib'

/**
 * Regras do template de importação de usuários (aba `data`).
 */
export const USERS_RULES_ENTRIES: RulesEntry[] = [
  {
    column: 'email',
    required: true,
    rules: ['E-mail válido', 'Único na empresa'],
  },
  {
    column: 'name',
    required: true,
    rules: ['Entre 2 e 255 caracteres (pessoa nova)'],
  },
  {
    column: 'type',
    required: false,
    rules: ['"EMPLOYEE" ou "VISITOR" (default EMPLOYEE)'],
  },
  {
    column: 'password',
    required: false,
    rules: ['Em branco usa a senha padrão de onboarding'],
  },
  {
    column: 'phone',
    required: false,
    rules: ['Até 32 caracteres'],
  },
  {
    column: 'document',
    required: false,
    rules: ['Único na base'],
  },
  {
    column: 'role',
    required: false,
    rules: ['Nome de um cargo ativo da empresa'],
  },
]
