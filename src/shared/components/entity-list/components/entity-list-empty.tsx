// Types
import type { EntityListEmptyProps } from '../types/entity-list.types'

/**
 * Estado vazio da listagem — renderiza o `emptyState` customizado em um
 * container estilizado (ou nada, se não houver).
 */
export function EntityListEmpty({ children }: EntityListEmptyProps) {
  if (!children) {
    return null
  }

  return (
    <div className="border-border bg-card text-foreground/80 flex min-h-35 flex-col items-center justify-center rounded-2xl border px-6 py-10 text-center text-sm">
      {children}
    </div>
  )
}
