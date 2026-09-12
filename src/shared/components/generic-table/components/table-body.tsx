// React
import { Fragment, useCallback } from 'react'

// TanStack Table
import { flexRender } from '@tanstack/react-table'

// Types
import type { KeyboardEvent } from 'react'
import type { TableBodyProps } from '../types/generic-table.types'

/**
 * `<tbody>` da tabela — linhas clicáveis (opcional) com suporte a teclado e,
 * quando a tabela é expansível, uma linha extra com o sub-conteúdo.
 */
export function TableBody<TData>({
  table,
  onRowClick,
  getRowAriaLabel,
  renderExpandedRow,
  getRowKey,
  expandedKeys,
  onToggleRow,
}: TableBodyProps<TData>) {
  const handleRowClick = useCallback(
    (row: TData) => {
      onRowClick?.(row)
    },
    [onRowClick],
  )

  const handleRowKeyDown = useCallback(
    (row: TData, e: KeyboardEvent<HTMLTableRowElement>) => {
      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onRowClick(row)
      }
    },
    [onRowClick],
  )

  return (
    <tbody>
      {table.getRowModel().rows.map((row, index) => {
        const key = getRowKey(row.original, index)
        const isExpanded = !!renderExpandedRow && expandedKeys.includes(key)
        const expandedRowId = `row-expanded-${key}`
        // Sem `onRowClick` a linha inteira alterna a expansão (alvo grande no
        // balcão); com `onRowClick`, o clique na linha é a ação da tela e só o
        // chevron expande. O `role="row"` é preservado nos dois casos — quem
        // carrega a semântica de controle é o botão do chevron.
        const rowToggles = !!renderExpandedRow && !onRowClick

        return (
          <Fragment key={row.id}>
            <tr
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
              aria-label={onRowClick && getRowAriaLabel ? getRowAriaLabel(row.original) : undefined}
              className="border-border hover:bg-muted/30 border-t transition-colors"
              onClick={() => (rowToggles ? onToggleRow(key) : handleRowClick(row.original))}
              onKeyDown={(e) => handleRowKeyDown(row.original, e)}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="min-w-0 overflow-hidden px-4 py-3 text-sm text-ellipsis"
                  style={{
                    width: cell.column.columnDef.size
                      ? `${cell.column.columnDef.size}px`
                      : undefined,
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>

            {isExpanded ? (
              <tr id={expandedRowId} className="border-border bg-muted/20 border-t">
                <td colSpan={row.getVisibleCells().length} className="px-4 py-3 text-sm">
                  {renderExpandedRow(row.original)}
                </td>
              </tr>
            ) : null}
          </Fragment>
        )
      })}
    </tbody>
  )
}
