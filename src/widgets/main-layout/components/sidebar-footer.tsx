// React
import { memo } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { ChevronLeft, ChevronRight, LogOut, Settings, User } from 'lucide-react'

// Types
import type { SidebarFooterSectionProps } from '../types/sidebar.type'

// Components
import { LanguageSelector } from '#/shared/components/language-selector'
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Label,
  SidebarFooter,
  SidebarMenuButton,
  ThemeToggle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/shared/components'

// Utils
import { getInitials } from '#/shared/utils/get-initials'

// Lib
import { cn } from '#/shared/lib/utils'

/**
 * Footer com menu de usuário, ações e toggle de sidebar.
 */
function SidebarFooterSectionComponent({
  open,
  user,
  onLogout,
  onToggleSidebar,
}: SidebarFooterSectionProps) {
  const { t } = useTranslation('mainLayout')

  return (
    <SidebarFooter className="border-sidebar-border border-t">
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {open ? (
              <>
                <Avatar className={cn('ring-primary size-9 shrink-0 ring-1')}>
                  <AvatarFallback className="text-primary bg-primary/10 text-md font-bold">
                    {user?.name ? getInitials(user.name) : <User size={20} />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{user?.name}</span>
                  <span className="text-sidebar-accent-foreground/50 truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="bg-sidebar-accent flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
                    >
                      <Avatar className={cn('ring-primary size-9 shrink-0 ring-1')}>
                        <AvatarFallback className="text-primary bg-primary/10 text-md font-bold">
                          {user?.name ? getInitials(user.name) : <User size={20} />}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>

                <TooltipContent side="right">
                  <p>{user?.name}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {open && (
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          )}

          <DropdownMenuContent className="px-3 py-2" side="right" align="start">
            <DropdownMenuGroup className="flex items-center justify-around">
              <div className="mr-2 flex items-center gap-2">
                <Label>{t('sidebar.language')}:</Label>
                <LanguageSelector />
              </div>
              <ThemeToggle />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onLogout}>
                <LogOut />
                {t('sidebar.logout')}
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SidebarMenuButton
        className="m-auto flex shrink-0 items-center justify-center hover:cursor-pointer"
        onClick={onToggleSidebar}
      >
        {!open ? <ChevronRight /> : <ChevronLeft />}
      </SidebarMenuButton>
    </SidebarFooter>
  )
}

export const SidebarFooterSection = memo(SidebarFooterSectionComponent)
