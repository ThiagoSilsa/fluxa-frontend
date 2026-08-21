// Lib
import type { RulesEntry } from '../../../lib/build-rules-rows.lib'

/**
 * Regras do template de importação de departamentos (aba `data`).
 */
export const DEPARTMENTS_RULES_ENTRIES: RulesEntry[] = [
  {
    column: 'name',
    required: true,
    rules: ['Entre 2 e 255 caracteres', 'Único na empresa'],
  },
  {
    column: 'parkingSpace',
    required: true,
    rules: ['Inteiro maior ou igual a 0 (0 = sem vagas)'],
  },
  {
    column: 'description',
    required: false,
    rules: ['Texto livre'],
  },
]
