// Types
import type { SidebarItem } from '../types/sidebar.type'
import type { SearchablePage } from '../types/search.type'

// Config
import { searchOverrides } from '../config/search-overrides'

/**
 * Achata recursivamente a árvore de itens da sidebar em um array plano de
 * páginas buscáveis. Itens sem `path` (ex: containers que só agrupam) não
 * geram entries próprias, mas seus breadcrumbs são preservados para os filhos.
 *
 * @param items - Itens da sidebar já filtrados por permissão
 * @param parentBreadcrumb - Breadcrumb acumulado dos pais (uso interno recursivo)
 * @returns Array plano de SearchablePage
 */
export function buildSearchIndex(
  items: SidebarItem[],
  parentBreadcrumb: string[] = [],
): SearchablePage[] {
  const result: SearchablePage[] = []

  for (const item of items) {
    const override = searchOverrides[item.label]
    const hasChildren = item.children && item.children.length > 0
    const hasGroups = item.groups && item.groups.length > 0

    // Se o item tem path próprio, adiciona ao índice
    if (item.path) {
      result.push({
        label: item.label,
        path: item.path,
        icon: item.icon,
        description: override?.description,
        breadcrumb: parentBreadcrumb,
        keywords: override?.keywords ?? [],
      })
    }

    // Se tem children (itens aninhados sem grupo), recursão com breadcrumb atualizado
    if (hasChildren) {
      const childBreadcrumb = item.path ? [...parentBreadcrumb, item.label] : parentBreadcrumb

      result.push(...buildSearchIndex(item.children!, childBreadcrumb))
    }

    // Se tem groups (subgrupos com cabeçalho), recursão para cada grupo
    // Inclui tanto o label do container quanto o label do grupo no breadcrumb
    if (hasGroups) {
      for (const group of item.groups!) {
        const groupBreadcrumb = [...parentBreadcrumb, item.label, group.label]

        result.push(...buildSearchIndex(group.items, groupBreadcrumb))
      }
    }
  }

  return result
}
