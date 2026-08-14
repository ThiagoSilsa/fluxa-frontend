// React
import { memo } from 'react'

// Router
import { useNavigate } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

// Types
import type { SidebarHeaderProps } from '../types/sidebar.type'

// Components
import { CompanyAvatar, Logo, SidebarHeader } from '#/shared/components'

/**
 * Cabeçalho da sidebar: logotipo e a empresa da sessão.
 *
 * TODO: Seletor de troca de empresa quando o recurso existir no frontend (o
 * backend já expõe GET /auth/companies e POST /auth/switch-company).
 */
export function SidebarHeaderComponent(_props: SidebarHeaderProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation('mainLayout')

  const handleLogoClick = () => {
    navigate({ to: '/home' })
  }

  return (
    <SidebarHeader className="border-sidebar-border border-b">
      <div className="flex flex-col gap-3 p-2">
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleLogoClick()
            }
          }}
        >
          <Logo size="sm" />
          <span className="text-sidebar-accent-foreground/60 -mt-1 font-mono text-[10px] font-semibold tracking-widest">
            SOMAR
          </span>
        </div>

        {/*
          Linha própria, fora do bloco do logo: o logo diz qual produto é, e a
          empresa é a outra pergunta — de qual acesso esta janela é. Separadas
          por uma régua para não se lerem como uma coisa só.

          Ausente para o SUPER_ADMIN, que não tem empresa, e para a sessão
          aberta antes de o backend passar a mandar o campo. Some junto com a
          régua: um traço solto sob o logo pareceria defeito de renderização.

          `hidden` no modo recolhido, e não a transição do bloco acima, porque
          ali a borda continuaria desenhada sobre uma faixa de 3rem.

          `-mx-4` cancela os dois recuos que ficam entre o conteúdo e a borda do
          sidebar — o do `SidebarHeader` e o deste bloco —, para a régua ir de
          ponta a ponta como a de baixo do cabeçalho. O `px-4` devolve o recuo
          ao conteúdo, que continua alinhado com o logo.
        */}
        {user?.companyName ? (
          <div
            data-slot="sidebar-header-company"
            className="border-sidebar-border -mx-4 border-t px-4 pt-3 group-data-[collapsible=icon]:hidden"
          >
            <div className="flex items-center gap-2 rounded-md p-1">
              <CompanyAvatar name={user.companyName} />
              <span className="truncate text-sm font-medium">{user.companyName}</span>
            </div>
            <p className="text-sidebar-accent-foreground/50 mt-1 truncate px-1 text-[10px] font-semibold tracking-widest uppercase">
              {t('sidebar.company.label')}
            </p>
          </div>
        ) : null}
      </div>
    </SidebarHeader>
  )
}

export const SidebarHeaderSection = memo(SidebarHeaderComponent)
