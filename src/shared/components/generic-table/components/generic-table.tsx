// React
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Components
import { TableBody } from './table-body'
import { TableEmpty } from './table-empty'
import { TableHeader } from './table-header'
import { TableLoading } from './table-loading'
import { TablePagination } from './table-pagination'
import { TableToolbar } from './table-toolbar'

// Hooks
import { useComfortableLoading } from '#/shared/hooks/use-comfortable-loading'

// Types
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

  const table = useReactTable({
    data,
    columns,
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

  const columnCount = columns.length

  return (
    <section className="flex flex-col">
      <TableToolbar filters={filters} toolbar={toolbar} />

      <div className="flex-1 py-6">
        {loading ? (
          <TableLoading columns={columnCount} />
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
              <TableBody table={table} onRowClick={onRowClick} getRowAriaLabel={getRowAriaLabel} />
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
