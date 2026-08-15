import type { ReactNode } from 'react'

// Components
import { Skeleton } from '#/shared/components/ui/skeleton'

export type HeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
  isLoading?: boolean
}

/**
 * Cabeçalho da página.
 *
 * `isLoading` é para o caso em que o **título é dado** — o nome da entidade,
 * e não um rótulo do i18n. Título que já se sabe antes de pedir qualquer
 * coisa não deve virar retângulo cinza: esconde de graça uma informação que a
 * pessoa já podia ler, e o texto aparecendo de repente faz a página parecer
 * recarregada em vez de carregada.
 */
export function Header({ title, subtitle, children, isLoading = false }: HeaderProps) {
  if (isLoading) {
    return (
      <header className="space-y-3">
        <div className="space-y-2">
          {/* Mesma altura do conteúdo real: `text-3xl` e `text-sm` da versão
              abaixo. As duas linhas saem sempre, para reservar o espaço que o
              cabeçalho vai ocupar e não empurrar a página quando ele chegar. */}
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
      </header>
    )
  }

  return (
    <header className="space-y-3">
      <div className="space-y-2">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-muted-foreground text-sm">{subtitle}</p> : null}
      </div>
      {children ? <div>{children}</div> : null}
    </header>
  )
}
