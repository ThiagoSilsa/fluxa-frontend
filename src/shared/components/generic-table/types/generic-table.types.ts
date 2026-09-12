import type { ReactNode } from 'react'

// TanStack Table
import type { ColumnDef, OnChangeFn, RowData, SortingState, Table } from '@tanstack/react-table'

// ─── Module augmentation: add className to ColumnMeta ───────────────────────
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
  }
}

/**
 * Props da tabela genérica.
 *
 * A expansão de linha é um **par** (sub-conteúdo + rótulos acessíveis): o
 * componente compartilhado não embute texto de idioma nenhum, então quem liga
 * a expansão precisa trazer os rótulos traduzidos junto.
 *
 * @template TData Tipo dos dados da tabela.
 */
export type GenericTableProps<TData> = GenericTableCommonProps<TData> &
  (
    | {
        /**
         * Sub-conteúdo de uma linha expandida — quando informado, a tabela
         * ganha uma coluna com o botão de expandir/recolher.
         *
         * Sem `onRowClick`, clicar na linha também alterna a expansão (alvo
         * grande para o balcão); com `onRowClick`, só o botão alterna (o
         * clique na linha continua sendo a ação da tela). O `role="row"` é
         * preservado nos dois casos.
         */
        renderExpandedRow: (row: TData) => ReactNode
        /** Rótulos acessíveis do botão de expandir/recolher (i18n do consumidor). */
        expandLabels: TableExpandLabels
      }
    | {
        /** Tabela sem expansão de linha (o default). */
        renderExpandedRow?: undefined
        expandLabels?: TableExpandLabels
      }
  )

/**
 * Props da tabela que não dependem da expansão de linha.
 *
 * `GenericTableProps` acrescenta a expansão como um **par**: quem renderiza
 * linha expandida precisa passar os rótulos traduzidos junto (o componente
 * compartilhado não embute texto em nenhum idioma).
 */
export type GenericTableCommonProps<TData> = {
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

  /**
   * Chave **estável** da linha (default: índice).
   *
   * É o que mantém a linha expandida correta quando a lista se reordena ou
   * ganha um item no topo entre dois refetches.
   */
  getRowKey?: (row: TData) => string

  /** Classes extras para o container da tabela (ex: overflow-x-auto). */
  tableContainerClassName?: string

  /** Oculta a barra de paginação (útil para tabelas sem paginação). */
  hidePagination?: boolean
}

/** Rótulos acessíveis do controle de expandir/recolher (i18n do consumidor). */
export type TableExpandLabels = {
  expand: string
  collapse: string
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

/** Props do corpo da tabela (inclui a expansão opt-in de linha). */
export type TableBodyProps<TData> = {
  table: Table<TData>
  onRowClick?: (row: TData) => void
  getRowAriaLabel?: (row: TData) => string
  /** Sub-conteúdo da linha expandida (quando a tabela é expansível). */
  renderExpandedRow?: (row: TData) => ReactNode
  /** Chave estável da linha (default: índice). */
  getRowKey: (row: TData, index: number) => string
  /** Chaves das linhas expandidas. */
  expandedKeys: string[]
  /** Alterna a expansão de uma linha. */
  onToggleRow: (key: string) => void
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
