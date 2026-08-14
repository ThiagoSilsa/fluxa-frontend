// React
import { memo } from 'react'

// Router
import { useNavigate, useRouterState } from '@tanstack/react-router'

// Icons
import { ChevronRight } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { containsPath } from '../lib/contains-path'

// Types
import type { SidebarItem } from '../types/sidebar.type'

// Components
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/shared/components'

/**
 * Renderização recursiva, permitindo inúmeros menus colapsáveis.
 */
function RenderSidebarItemsComponent({
  items,
  open,
  setOpen,
}: {
  items: SidebarItem[]
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const navigate = useNavigate()

  const routerState = useRouterState()

  const currentLocation = routerState.location.pathname

  const { t } = useTranslation('mainLayout')

  return items.map((item) => {
    const hasChildren = item.children && item.children.length > 0
    const hasGroups = item.groups && item.groups.length > 0
    const isExpandable = hasChildren || hasGroups

    const isActive = currentLocation === item.path

    // EXPANDABLE
    if (isExpandable) {
      return (
        <SidebarMenuItem key={item.label}>
          {/* Nasce aberto quando a página atual está dentro dele. É
              `defaultOpen`, e não controlado: depois disso quem manda é quem
              clica, e reabrir sozinho a cada renderização impediria de fechar.

              Recarregar remonta a barra, então a conta refaz — que é o momento
              em que ela precisa valer. */}
          <Collapsible
            className="group/collapsible"
            defaultOpen={containsPath(item, currentLocation)}
          >
            <Tooltip key={String(open)}>
              <TooltipTrigger asChild>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => setOpen(true)}
                    className="ml-2 hover:cursor-pointer"
                  >
                    <item.icon />

                    <span data-slot="sidebar-label" className="block truncate">
                      {t(item.label)}
                    </span>

                    <ChevronRight data-slot="sidebar-chevron" className="ml-auto h-4 w-4" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </TooltipTrigger>

              <TooltipContent side="right" className={open ? 'hidden' : ''}>
                {t(item.tooltipLabel || item.label)}
              </TooltipContent>
            </Tooltip>

            {open && (
              <CollapsibleContent>
                {hasGroups ? (
                  <div className="mt-1 ml-6 flex flex-col gap-2">
                    {item.groups!.map((group) => (
                      <div key={group.label}>
                        <p className="text-sidebar-accent-foreground/50 truncate px-2 pt-1 pb-0.5 text-[10px] font-semibold tracking-widest uppercase">
                          {t(group.label)}
                        </p>
                        <SidebarMenu>
                          <RenderSidebarItems items={group.items} open={open} setOpen={setOpen} />
                        </SidebarMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <SidebarMenu className="mt-1 ml-6">
                    <RenderSidebarItems items={item.children!} open={open} setOpen={setOpen} />
                  </SidebarMenu>
                )}
              </CollapsibleContent>
            )}
          </Collapsible>
        </SidebarMenuItem>
      )
    }

    // NORMAL ITEM
    return (
      <SidebarMenuItem key={item.path}>
        <Tooltip key={String(open)}>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              isActive={isActive}
              onClick={() =>
                item.path &&
                navigate({
                  to: item.path,
                })
              }
              className="ml-2 hover:cursor-pointer"
            >
              <item.icon />

              <span data-slot="sidebar-label" className="block truncate">
                {t(item.label)}
              </span>
            </SidebarMenuButton>
          </TooltipTrigger>

          <TooltipContent side="right" className={open ? 'hidden' : ''}>
            {t(item.tooltipLabel || item.label)}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    )
  })
}

export const RenderSidebarItems = memo(RenderSidebarItemsComponent)
