// Types
import type { TFunction } from 'i18next'

/** Entrada da aba de regras de um template. */
export type RulesEntry = {
  /** Coluna da aba `data`. */
  column: string
  /** Se a coluna é obrigatória. */
  required: boolean
  /** Regras aceitas pela coluna. */
  rules: string[]
}

/**
 * Monta as linhas da aba de regras (cabeçalho + entradas).
 *
 * @param entries Entradas de regras do template.
 * @param t Função de tradução (i18n).
 * @returns Linhas prontas para a planilha.
 */
export function buildRulesRows(entries: RulesEntry[], t: TFunction): unknown[][] {
  return [
    [t('rules.headers.column'), t('rules.headers.required'), t('rules.headers.rules')],
    ...entries.map((entry) => [
      entry.column,
      entry.required ? t('rules.yes') : t('rules.no'),
      entry.rules.join('; '),
    ]),
  ]
}
