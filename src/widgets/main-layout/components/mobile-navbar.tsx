// React
import { memo } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { Menu } from 'lucide-react'

// Components
import { Button, Logo, useSidebar } from '#/shared/components'

/**
 * Navbar mobile fixa no topo com botão hambúrguer (esquerda) e logo (centro).
 * Aparece apenas quando isMobile === true.
 */
function MobileNavbarComponent() {
  const { isMobile, toggleSidebar, open, setOpen } = useSidebar()
  const { t } = useTranslation('mainLayout')

  if (!isMobile) return null

  return (
    <div className="bg-sidebar text-sidebar-foreground border-sidebar-border fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between border-b px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          toggleSidebar()
          setOpen(!open)
        }}
        aria-label={t('navbar.toggleMenu')}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Logo size="sm" />

      {/* Espaçador para manter o logo centralizado */}
      <div className="w-10" />
    </div>
  )
}

export const MobileNavbar = memo(MobileNavbarComponent)
