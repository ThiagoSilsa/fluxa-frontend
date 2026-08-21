import type { ReactNode } from 'react'

// TanStack Table
import type { ColumnDef, OnChangeFn, RowData, SortingState } from '@tanstack/react-table'

// ─── Module augmentation: add className to ColumnMeta ───────────────────────
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
  }
}

export type GenericTableProps<TData> = {
  /** Dados a serem exibidos na tabela */
  data: TData[]

  /** Definições das colunas (TanStack Table) */
  columns: ColumnDef<TData>[]

  /** Estado de carregamento */
  loading?: boolean

  /** Total de registros (para paginação server-side) */
  total: number

  /** Índice da página atual (0-based) */
  pageIndex: number

  /** Quantidade de itens por página */
  pageSize: number

  /** Callback disparado ao mudar de página */
  onPageChange: (page: number) => void

  /** Callback disparado ao alterar o page size */
  onPageSizeChange: (size: number) => void

  /** Estado de ordenação atual */
  sorting?: SortingState

  /** Callback disparado ao alterar ordenação */
  onSortingChange?: OnChangeFn<SortingState>

  /** Filtros renderizados por composição */
  filters?: ReactNode

  /** Ações extras na toolbar */
  toolbar?: ReactNode

  /** Estado vazio customizado */
  emptyState?: ReactNode

  /** Habilita ordenação nas colunas */
  enableSorting?: boolean

  /** Labels da paginacao (para i18n). */
  paginationLabels?: TablePaginationLabels

  /** Callback disparado ao clicar em uma linha */
  onRowClick?: (row: TData) => void

  /** Função para obter o aria-label da linha (acessibilidade). */
  getRowAriaLabel?: (row: TData) => string

  /** Classes extras para o container da tabela (ex: overflow-x-auto). */
  tableContainerClassName?: string

  /** Oculta a barra de paginação (útil para tabelas sem paginação). */
  hidePagination?: boolean
}

export type UseGenericTableSearchOptions<TSearch extends Record<string, unknown>> = {
  path: string
  search: TSearch
}

export type UseGenericTableSearchReturn<TSearch extends Record<string, unknown>> = {
  limit: number | undefined
  offset: number | undefined
  pageIndex: number
  pageSize: number
  sortBy: string | undefined
  sortOrder: 'ASC' | 'DESC' | undefined
  sorting: SortingState
  updateSearch: (next: Partial<TSearch>) => void
  updatePagination: (next: Partial<TSearch>) => void
  updateOffset: (offset: number) => void
  updateLimit: (limit: number) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSortingChange: (updater: SortingState | ((old: SortingState) => SortingState)) => void
}

export type TableToolbarProps = {
  filters?: ReactNode
  toolbar?: ReactNode
}

export type TablePaginationLabels = {
  limit: string
  first: string
  previous: string
  next: string
  last: string
}

export type TablePaginationProps = {
  total: number
  pageIndex: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  labels: TablePaginationLabels
}

export type TableLoadingProps = {
  columns: number
  rows?: number
}

export type TableEmptyProps = {
  children?: ReactNode
}
