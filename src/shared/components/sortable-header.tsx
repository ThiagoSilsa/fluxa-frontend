import type { CSSProperties, MouseEvent, ReactNode } from 'react'

// Icons
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

// lib
import { cn } from '#/shared/lib/utils'

export type SortState = 'asc' | 'desc' | null

export type SortableHeaderProps = {
  /** Direção atual da ordenação da coluna. */
  direction: SortState
  /** Handler de ordenação (do TanStack) ou `undefined` se não ordenável. */
  onSort?: (event: MouseEvent<HTMLElement>) => void
  children: ReactNode
  colSpan?: number
  style?: CSSProperties
  className?: string
}

/**
 * `<th>` ordenável — indicador visual de ordenação (⇅/▲/▼) e aria-sort.
 * Sem `onSort`, a coluna não é ordenável (cursor padrão).
 */
export function SortableHeader({
  direction,
  onSort,
  children,
  colSpan,
  style,
  className,
}: SortableHeaderProps) {
  const ariaSort = direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'

  return (
    <th
      aria-sort={onSort ? ariaSort : undefined}
      colSpan={colSpan}
      style={style}
      className={cn('select-none', onSort && 'cursor-pointer', className)}
      onClick={onSort}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {onSort ? (
          direction === 'asc' ? (
            <ArrowUp className="size-3.5 shrink-0" />
          ) : direction === 'desc' ? (
            <ArrowDown className="size-3.5 shrink-0" />
          ) : (
            <ArrowUpDown className="size-3.5 shrink-0 opacity-30" />
          )
        ) : null}
      </span>
    </th>
  )
}
