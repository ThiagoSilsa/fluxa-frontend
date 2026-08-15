// React
import { useCallback } from 'react'

// TanStack Table
import { flexRender } from '@tanstack/react-table'

// Types
import type { Table } from '@tanstack/react-table'

export type TableBodyProps<TData> = {
  table: Table<TData>
  onRowClick?: (row: TData) => void
  getRowAriaLabel?: (row: TData) => string
}

/**
 * `<tbody>` da tabela — linhas clicáveis (opcional) com suporte a teclado.
 */
export function TableBody<TData>({ table, onRowClick, getRowAriaLabel }: TableBodyProps<TData>) {
  const handleRowClick = useCallback(
    (row: TData) => {
      onRowClick?.(row)
    },
    [onRowClick],
  )

  const handleRowKeyDown = useCallback(
    (row: TData, e: React.KeyboardEvent) => {
      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onRowClick(row)
      }
    },
    [onRowClick],
  )

  return (
    <tbody>
      {table.getRowModel().rows.map((row) => (
        <tr
          key={row.id}
          tabIndex={onRowClick ? 0 : undefined}
          role={onRowClick ? 'button' : undefined}
          aria-label={onRowClick && getRowAriaLabel ? getRowAriaLabel(row.original) : undefined}
          className="border-border hover:bg-muted/30 border-t transition-colors"
          onClick={() => handleRowClick(row.original)}
          onKeyDown={(e) => handleRowKeyDown(row.original, e)}
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={cell.id}
              className="min-w-0 overflow-hidden px-4 py-3 text-sm text-ellipsis"
              style={{
                width: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : undefined,
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
