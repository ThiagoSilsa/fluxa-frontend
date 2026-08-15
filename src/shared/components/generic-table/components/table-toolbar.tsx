// Types
import type { TableToolbarProps } from '../types/generic-table.types'

/**
 * Toolbar da tabela — filtros à esquerda e ações à direita (por composição).
 */
export function TableToolbar({ filters, toolbar }: TableToolbarProps) {
  if (!filters && !toolbar) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">{filters}</div>
      <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
    </div>
  )
}
