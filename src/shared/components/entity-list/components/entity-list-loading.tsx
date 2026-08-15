// Types
import type { EntityListLoadingProps } from '../types/entity-list.types'

// Components
import { Skeleton } from '#/shared/components/ui/skeleton'

// lib
import { cn } from '#/shared/lib/utils'

const defaultGridClassName = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

/**
 * Skeleton de carregamento em formato de cards — usa o mesmo `gridClassName`
 * do estado carregado para manter o layout consistente.
 */
export function EntityListLoading({ count = 6, gridClassName }: EntityListLoadingProps) {
  return (
    <div className={cn('grid gap-4', gridClassName ?? defaultGridClassName)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full" />
      ))}
    </div>
  )
}
