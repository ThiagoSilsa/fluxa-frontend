// Types
import type { EntryDenialReason } from '../types/access.types'

/**
 * Mapeia o motivo do impedimento para a chave de tradução do namespace
 * `access` (ex.: `BLOCKED` → `denial.reasons.BLOCKED`).
 *
 * @param reason Motivo devolvido pelo backend.
 * @returns Chave i18n.
 */
export function getEntryDenialReasonKey(reason: EntryDenialReason): string {
  return `denial.reasons.${reason}`
}

/**
 * Tom da barra de ocupação conforme o percentual.
 *
 * - `null`: sem capacidade configurada (barra neutra);
 * - `safe`: até 79% (verde);
 * - `warning`: 80–100% (âmbar);
 * - `danger`: acima de 100% (excedendo a capacidade — vermelho).
 */
export type OccupancyTone = 'safe' | 'warning' | 'danger'

export function getOccupancyTone(rate: number | null): OccupancyTone | null {
  if (rate === null) {
    return null
  }
  if (rate > 100) {
    return 'danger'
  }
  if (rate >= 80) {
    return 'warning'
  }
  return 'safe'
}

/**
 * Formata um instante ISO em data/hora local (ex.: `21/08/2026 14:30`).
 *
 * Valores `null`/vazios devolvem `'—'` (traço) para a UI não exibir
 * "undefined".
 *
 * @param iso Instante ISO ou `null`.
 * @returns Data/hora formatada no locale pt-BR.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return '—'
  }

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
