// Types
import type { AuthUser } from '#/shared/types/auth.types'

export type SidebarGroup = {
  /** Chave i18n para o cabeçalho do grupo */
  label: string
  /** Itens dentro do grupo */
  items: SidebarItem[]
}

export type SidebarItem = {
  label: string
  icon: React.ElementType
  tooltipLabel?: string
  path?: string
  /**
   * Caminhos que pertencem a este item além do próprio `path`.
   *
   * Serve para o menu recolhível nascer aberto na página certa quando o
   * endereço dela não desce de `path` — o detalhe de uma unidade mora em
   * `/management/unit/:id`, e a lista, em `/management/units`.
   */
  matchPaths?: string[]
  permissions?: string[]
  roles?: string[]
  children?: SidebarItem[]
  /** Subgrupos com cabeçalho. Quando presente, substitui `children` na renderização. */
  groups?: SidebarGroup[]
}

export type SidebarFooterSectionProps = {
  open: boolean
  user: AuthUser | null
  onLogout: () => void
  onToggleSidebar: () => void
}

export type SidebarHeaderProps = {
  state: 'expanded' | 'collapsed' | string
}
