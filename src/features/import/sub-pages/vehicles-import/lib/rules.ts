// Lib
import type { RulesEntry } from '../../../lib/build-rules-rows.lib'

/**
 * Regras do template de importação de veículos (aba `data`).
 */
export const VEHICLES_RULES_ENTRIES: RulesEntry[] = [
  {
    column: 'plate',
    required: true,
    rules: ['Formato brasileiro (ABC1234 ou ABC1D23)', 'Única na empresa'],
  },
  {
    column: 'vehicleType',
    required: true,
    rules: ['Código de um tipo ativo da empresa (ex.: FROTA)'],
  },
  {
    column: 'model',
    required: false,
    rules: ['Até 100 caracteres'],
  },
  {
    column: 'color',
    required: false,
    rules: ['Até 50 caracteres'],
  },
  {
    column: 'observation',
    required: false,
    rules: ['Texto livre'],
  },
  {
    column: 'freePass',
    required: false,
    rules: ['"true" ou "false" (default false)', 'Conceder exige permissão específica'],
  },
  {
    column: 'department',
    required: false,
    rules: ['Nome de um departamento da empresa (departamento padrão)'],
  },
]
