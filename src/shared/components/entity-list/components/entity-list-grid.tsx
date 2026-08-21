// Types
import type { EntityListGridProps } from '../types/entity-list.types'

// lib
import { cn } from '#/shared/lib/utils'

const defaultGridClassName = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

/**
 * Container do grid de cards — o layout é controlado por `className` (padrão
 * responsivo de 1 a 4 colunas).
 */
export function EntityListGrid({ children, className }: EntityListGridProps) {
  return <div className={cn('grid gap-4', className ?? defaultGridClassName)}>{children}</div>
}
