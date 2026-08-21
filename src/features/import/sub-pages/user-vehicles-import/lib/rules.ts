// Lib
import type { RulesEntry } from '../../../lib/build-rules-rows.lib'

/**
 * Regras do template de importação de vínculo usuário-veículo (aba `data`).
 */
export const USER_VEHICLES_RULES_ENTRIES: RulesEntry[] = [
  {
    column: 'vehiclePlate',
    required: true,
    rules: ['Placa de um veículo cadastrado na empresa'],
  },
  {
    column: 'userEmail',
    required: true,
    rules: ['E-mail de um usuário com vínculo ativo na empresa'],
  },
  {
    column: 'isPrimary',
    required: false,
    rules: ['"true" ou "false" (default false)', '1 proprietário primário por veículo'],
  },
  {
    column: 'canDrive',
    required: false,
    rules: ['"true" ou "false" (default true)'],
  },
]
