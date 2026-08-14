// React
import { memo, useMemo } from 'react'

// Config
import { sidebarItems } from '../config/sidebar-items'

// lib
import { filterSidebarItems } from '../lib/filter-sidebar-items'

// Components
import { RenderSidebarItems } from './sidebar-menu-itens'
import { SidebarFooterSection } from './sidebar-footer'
import { SidebarHeaderSection } from './sidebar-header'
import SidebarSearch from './sidebar-search'
import {
  ScrollArea,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from '#/shared/components'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

/**
 * Componente principal da sidebar: controle de autenticação, permissão e
 * layout.
 */
function AppSidebarComponent() {
  const { user, logout } = useAuth()

  const { state, open, toggleSidebar, setOpen, isMobile } = useSidebar()

  // Consolida o estado de exibição: no mobile o Sheet é sempre full-width,
  // então é tratado como expandido, independente dos valores do desktop.
  const displayOpen = isMobile ? true : open
  const displayState = isMobile ? 'expanded' : state
  const displaySetOpen = isMobile ? () => {} : setOpen

  // Memoiza os itens permitidos para não recalcular a cada renderização.
  const permittedItems = useMemo(() => filterSidebarItems(sidebarItems, user), [user])

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeaderSection state={displayState} />
      <SidebarSearch items={permittedItems} open={displayOpen} setOpen={displaySetOpen} />
      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <RenderSidebarItems
                  items={permittedItems}
                  open={displayOpen}
                  setOpen={displaySetOpen}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooterSection
        open={displayOpen}
        user={user}
        onLogout={logout}
        onToggleSidebar={toggleSidebar}
      />
    </Sidebar>
  )
}

export const AppSidebar = memo(AppSidebarComponent)
