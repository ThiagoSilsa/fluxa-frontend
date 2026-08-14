// Utils
import { cn } from '#/lib/utils'

interface LogoProps {
  /** Tamanho do logotipo. */
  size?: 'sm' | 'default'
  className?: string
}

/**
 * Logotipo da aplicação (wordmark "Fluxa").
 *
 * TODO: Substituir por asset oficial quando existir.
 */
export function Logo({ size = 'default', className }: LogoProps) {
  return (
    <span
      data-slot="logo"
      className={cn(
        'font-semibold tracking-tight',
        size === 'sm' ? 'text-base' : 'text-lg',
        className,
      )}
    >
      Fluxa
    </span>
  )
}
