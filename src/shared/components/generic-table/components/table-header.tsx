// TanStack Table
import { flexRender } from '@tanstack/react-table'

// Components
import { SortableHeader } from '#/shared/components/sortable-header'

// Types
import type { Table } from '@tanstack/react-table'
import type { SortState } from '#/shared/components/sortable-header'

// Lib
import { cn } from '#/shared/lib/utils'

export type TableHeaderProps<TData> = {
  table: Table<TData>
}

/**
 * `<thead>` da tabela — colunas ordenáveis via `SortableHeader`.
 */
export function TableHeader<TData>({ table }: TableHeaderProps<TData>) {
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const meta = header.column.columnDef.meta
            const canSort = header.column.getCanSort()

            // `getIsSorted()` devolve `false` quando a coluna não está
            // ordenada; o componente compartilhado usa `null` para isso.
            const sorted = header.column.getIsSorted()
            const direction: SortState = sorted === false ? null : sorted

            // Mantém o handler do TanStack em vez de chamar `toggleSorting()`:
            // é ele que lê o shift do evento para a ordenação múltipla.
            const toggleSorting = header.column.getToggleSortingHandler()

            return (
              <SortableHeader
                key={header.id}
                direction={direction}
                onSort={canSort && toggleSorting ? toggleSorting : undefined}
                colSpan={header.colSpan}
                style={{
                  width: header.column.columnDef.size
                    ? `${header.column.columnDef.size}px`
                    : undefined,
                }}
                className={cn(
                  'bg-muted/50 text-muted-foreground h-10 min-w-0 overflow-hidden px-4 text-left text-xs font-medium tracking-wider text-ellipsis uppercase',
                  canSort && 'hover:bg-muted/70',
                  meta?.className,
                )}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </SortableHeader>
            )
          })}
        </tr>
      ))}
    </thead>
  )
}
