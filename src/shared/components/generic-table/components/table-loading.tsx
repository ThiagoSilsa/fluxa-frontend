// Types
import type { TableLoadingProps } from '../types/generic-table.types'

// Components
import { Skeleton } from '#/shared/components/ui/skeleton'

/**
 * Skeleton de carregamento em formato de tabela (header + linhas).
 */
export function TableLoading({ columns, rows = 5 }: TableLoadingProps) {
  return (
    <div className="border-border rounded-2xl border">
      {/* Header */}
      <div className="bg-muted/50 flex gap-4 border-b px-4 py-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-3 flex-1" />
        ))}
      </div>

      {/* Body */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((__, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
