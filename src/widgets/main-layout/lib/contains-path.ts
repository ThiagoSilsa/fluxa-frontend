// Types
import type { SidebarItem } from '../types/sidebar.type'

/**
 * Itens que descem de um item do menu, venham de `children` ou de `groups`.
 *
 * @param item Item do menu.
 * @returns Os filhos diretos, de onde quer que estejam declarados.
 */
function descendantsOf(item: SidebarItem): SidebarItem[] {
  return [...(item.children ?? []), ...(item.groups?.flatMap((group) => group.items) ?? [])]
}

/**
 * Se a página atual está em algum lugar abaixo deste item do menu.
 *
 * É o que decide se um menu recolhível nasce aberto. Sem isso, recarregar
 * fecha o menu que contém a página aberta, e a barra deixa de dizer onde a
 * pessoa está — justamente no momento em que ela precisa se localizar.
 *
 * Compara por prefixo de segmento, e não por igualdade: o detalhe de uma
 * unidade (`/management/unit/abc`) pertence ao mesmo menu que a lista
 * (`/management/units`), e igualdade exata fecharia o menu ao abrir o detalhe.
 * O corte por `/` evita que `/management/units` case com `/management/unitsX`.
 *
 * @param item Item do menu.
 * @param pathname Caminho da página aberta.
 * @returns `true` quando a página está neste item ou abaixo dele.
 */
export function containsPath(item: SidebarItem, pathname: string): boolean {
  const owned = [item.path, ...(item.matchPaths ?? [])].filter(Boolean) as string[]

  if (owned.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return true
  }

  return descendantsOf(item).some((child) => containsPath(child, pathname))
}
