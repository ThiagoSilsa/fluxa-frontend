// React
import { useCallback, useMemo, useState } from 'react'

// TanStack Table
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Components
import { TableBody } from './table-body'
import { TableEmpty } from './table-empty'
import { TableExpanderButton } from './table-expander-button'
import { TableHeader } from './table-header'
import { TableLoading } from './table-loading'
import { TablePagination } from './table-pagination'
import { TableToolbar } from './table-toolbar'

// Hooks
import { useComfortableLoading } from '#/shared/hooks/use-comfortable-loading'

// Types
import type { ColumnDef } from '@tanstack/react-table'
import type { GenericTableProps } from '../types/generic-table.types'

/**
 * Tabela genérica baseada em TanStack Table — renderiza dados e callbacks por
 * props, sem conhecer API, entidade, rotas ou regras de negócio.
 *
 * Paginação server-side (`pageIndex`/`pageSize`), ordenação server-side
 * (opcional), toolbar (filtros + ações por composição), loading e empty state.
 *
 * @template TData Tipo dos dados da tabela.
 */
export function GenericTable<TData>({
  data,
  columns,
  loading: rawLoading = false,
  total,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sorting,
  onSortingChange,
  filters,
  toolbar,
  emptyState,
  enableSorting = false,
  paginationLabels,
  onRowClick,
  getRowAriaLabel,
  renderExpandedRow,
  getRowKey,
  expandLabels,
  tableContainerClassName,
  hidePagination = false,
}: GenericTableProps<TData>) {
  /*
    Piso de visibilidade aqui dentro, e não em cada chamador: são sete telas
    usando esta tabela, e o esqueleto é desenhado por ela. Vale também para o
    estado vazio — trocar esqueleto por "nenhum resultado" em 40 ms é o mesmo
    piscar, com o agravante de a mensagem chegar depois de dois solavancos.
  */
  const loading = useComfortableLoading(rawLoading)

  // Expansão opt-in: a chave estável mantém a linha aberta quando o polling
  // reordena/insere itens no topo.
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])

  const resolveRowKey = useCallback(
    (row: TData, index: number) => getRowKey?.(row) ?? String(index),
    [getRowKey],
  )

  const toggleRow = useCallback((key: string) => {
    setExpandedKeys((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    )
  }, [])

  /** Coluna do chevron, prependada apenas quando a tabela é expansível. */
  const expanderColumn = useMemo<ColumnDef<TData> | null>(() => {
    // O tipo já exige o par (linha expandida + rótulos); a checagem cobre um
    // chamador sem tipos — melhor tabela sem expansão do que controle sem nome
    // acessível.
    if (!renderExpandedRow || !expandLabels) {
      return null
    }

    return {
      id: 'expander',
      header: () => null,
      enableSorting: false,
      size: 44,
      cell: ({ row, table: tableInstance }) => {
        const index = tableInstance.getRowModel().rows.findIndex((item) => item.id === row.id)
        const key = resolveRowKey(row.original, index)
        return (
          <TableExpanderButton
            rowKey={key}
            isExpanded={expandedKeys.includes(key)}
            onToggle={toggleRow}
            labels={expandLabels}
            controlsId={`row-expanded-${key}`}
          />
        )
      },
    }
  }, [renderExpandedRow, resolveRowKey, expandedKeys, toggleRow, expandLabels])

  const tableColumns = useMemo(
    () => (expanderColumn ? [expanderColumn, ...columns] : columns),
    [expanderColumn, columns],
  )

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
    manualSorting: enableSorting,
    state: {
      pagination: { pageIndex, pageSize },
      ...(enableSorting ? { sorting: sorting ?? [] } : {}),
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater({ pageIndex, pageSize })
        if (next.pageIndex !== pageIndex) {
          onPageChange(next.pageIndex)
        }
        if (next.pageSize !== pageSize) {
          onPageSizeChange(next.pageSize)
        }
      }
    },
    ...(enableSorting && onSortingChange ? { onSortingChange, enableSorting: true } : {}),
  })

  return (
    <section className="flex flex-col">
      <TableToolbar filters={filters} toolbar={toolbar} />

      <div className="flex-1 py-6">
        {loading ? (
          <TableLoading columns={tableColumns.length} />
        ) : data.length === 0 ? (
          <TableEmpty>{emptyState}</TableEmpty>
        ) : (
          <div
            className={`border-border rounded-lg border ${tableContainerClassName ?? 'overflow-x-auto'}`}
          >
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                {table.getAllColumns().map((col) => (
                  <col
                    key={col.id}
                    style={{
                      width: col.columnDef.size ? `${col.columnDef.size}px` : undefined,
                    }}
                  />
                ))}
              </colgroup>
              <TableHeader table={table} />
              <TableBody
                table={table}
                onRowClick={onRowClick}
                getRowAriaLabel={getRowAriaLabel}
                renderExpandedRow={renderExpandedRow}
                getRowKey={resolveRowKey}
                expandedKeys={expandedKeys}
                onToggleRow={toggleRow}
              />
            </table>
          </div>
        )}
      </div>

      {!hidePagination && (
        <div className="mt-auto pt-6">
          <TablePagination
            total={total}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            labels={
              paginationLabels ?? {
                limit: 'Itens por página',
                first: 'Primeira página',
                previous: 'Página anterior',
                next: 'Próxima página',
                last: 'Última página',
              }
            }
          />
        </div>
      )}
    </section>
  )
}
