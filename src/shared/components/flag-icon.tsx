// Utils
import { cn } from '#/lib/utils'

// Types
import type { AppLanguage } from '#/shared/lib/language.lib'

interface FlagIconProps {
  language: AppLanguage
  className?: string
}

/**
 * Ícone de idioma: selo pequeno com a sigla do idioma.
 */
export function FlagIcon({ language, className }: FlagIconProps) {
  return (
    <span
      className={cn(
        'bg-muted text-muted-foreground flex items-center justify-center rounded-xs text-[10px] font-semibold uppercase',
        className,
      )}
      aria-hidden="true"
    >
      {language}
    </span>
  )
}
