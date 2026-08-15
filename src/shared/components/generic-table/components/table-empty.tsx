// Types
import type { TableEmptyProps } from '../types/generic-table.types'

/**
 * Estado vazio da tabela — renderiza o `emptyState` customizado em um
 * container estilizado (ou nada, se não houver).
 */
export function TableEmpty({ children }: TableEmptyProps) {
  if (!children) {
    return null
  }

  return (
    <div className="border-border bg-card text-foreground/80 flex min-h-35 flex-col items-center justify-center rounded-2xl border px-6 py-10 text-center text-sm">
      {children}
    </div>
  )
}
