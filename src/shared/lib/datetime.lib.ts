// i18n
import i18n from '#/shared/i18n'

// Lib
import { toLocaleTag } from './language.lib'

/**
 * Formatação de data/hora da interface.
 *
 * Caminho **único**: as telas que mostram data/hora (registros da portaria,
 * detalhe da solicitação, bloqueios, dispositivos) chamam daqui, para nenhuma
 * delas voltar a fixar um locale no código.
 */

/**
 * Locale em uso na interface — o mesmo que os textos ao redor usam.
 *
 * Lê o idioma corrente do i18n (o que a detecção do navegador ou a escolha
 * manual aplicou) em vez de olhar o navegador de novo: a data precisa combinar
 * com o idioma do texto, inclusive quando alguém troca o idioma pelo seletor.
 *
 * @returns Locale de formatação (`pt-BR`, `en-US` ou `es-ES`).
 */
export function getActiveLocale(): string {
  return toLocaleTag(i18n.language)
}

/**
 * Formata um instante ISO em data/hora local (ex.: `21/08/2026 14:30`).
 *
 * Valores `null`/vazios devolvem `'—'` (traço) para a UI não exibir
 * "undefined".
 *
 * @param iso Instante ISO ou `null`.
 * @param locale Locale de formatação (default: o idioma em uso).
 * @returns Data/hora formatada no idioma da interface.
 */
export function formatDateTime(iso: string | null | undefined, locale?: string): string {
  if (!iso) {
    return '—'
  }

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat(locale ?? getActiveLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
