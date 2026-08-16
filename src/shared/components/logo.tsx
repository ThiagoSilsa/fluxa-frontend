// Utils
import { cn } from '#/shared/lib/utils'

interface LogoProps {
  /** Tamanho do logotipo. */
  size?: 'sm' | 'default'
  className?: string
}

/**
 * Logotipo da aplicação.
 *
 * No modo recolhido da sidebar (`data-collapsible="icon"`) mostra apenas a
 * marca "F"; expandido, mostra o wordmark "Fluxa". Fora da sidebar (ex.:
 * navbar mobile) sempre mostra o wordmark.
 *
 * TODO: Substituir por asset oficial quando existir.
 */
export function Logo({ size = 'default', className }: LogoProps) {
  return (
    <span data-slot="logo" className={cn('inline-flex items-center', className)}>
      {/* Wordmark — escondido no modo recolhido da sidebar. */}
      <span
        className={cn(
          'font-semibold tracking-tight group-data-[collapsible=icon]:hidden',
          size === 'sm' ? 'text-base' : 'text-lg',
        )}
      >
        Fluxa
      </span>

      {/* Marca "F" — visível apenas no modo recolhido da sidebar. */}
      <span
        aria-hidden="true"
        className="bg-primary text-primary-foreground hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-bold group-data-[collapsible=icon]:flex"
      >
        F
      </span>
    </span>
  )
}
