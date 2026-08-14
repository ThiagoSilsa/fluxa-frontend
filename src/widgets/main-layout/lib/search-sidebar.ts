// Types
import type { TFunction } from 'i18next'
import type { SearchablePage, SearchResult } from '../types/search.type'

/**
 * Busca páginas no índice flat por relevância textual.
 * A busca é case-insensitive e opera sobre os labels traduzidos via i18n.
 *
 * Scoring:
 * - Match no label traduzido: 10pts
 * - Match na descrição traduzida: 5pts
 * - Match em keywords: 3pts
 * - Match em breadcrumb: 2pts
 *
 * @param query - Termo digitado pelo usuário
 * @param index - Índice flat de páginas (gerado por buildSearchIndex)
 * @param t - Função de tradução do i18next (ex: useTranslation('mainLayout').t)
 * @returns Array de resultados ordenados por relevância (decrescente)
 */
export function searchPages(query: string, index: SearchablePage[], t: TFunction): SearchResult[] {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return []
  }

  return index
    .map((item) => {
      // Versões com casing original para exibição
      const translatedLabel = t(item.label)
      const translatedBreadcrumb = item.breadcrumb.map((b) => t(b))
      const translatedDescription = item.description ? t(item.description) : undefined

      // Versões normalizadas (lowercase) para comparação case-insensitive
      const normalizedLabel = translatedLabel.toLowerCase()
      const normalizedBreadcrumb = translatedBreadcrumb.map((b) => b.toLowerCase())
      const normalizedDescription = translatedDescription?.toLowerCase()

      let score = 0

      // Match no label (maior peso)
      if (normalizedLabel.includes(normalizedQuery)) {
        score += 10
      }

      // Match na descrição
      if (normalizedDescription?.includes(normalizedQuery)) {
        score += 5
      }

      // Match em keywords
      for (const keyword of item.keywords) {
        if (keyword.toLowerCase().includes(normalizedQuery)) {
          score += 3
        }
      }

      // Match em breadcrumbs
      for (const bc of normalizedBreadcrumb) {
        if (bc.includes(normalizedQuery)) {
          score += 2
        }
      }

      return {
        ...item,
        translatedLabel,
        translatedBreadcrumb,
        translatedDescription,
        score,
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      // Descendente por score
      if (b.score !== a.score) return b.score - a.score
      // Desempate: ordem alfabética do label
      return a.translatedLabel.localeCompare(b.translatedLabel)
    })
}
