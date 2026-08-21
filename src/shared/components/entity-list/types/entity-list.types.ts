import type { ReactNode } from 'react'

export type EntityListPaginationLabels = {
  limit: string
  first: string
  previous: string
  next: string
  last: string
}

export type EntityListPaginationProps = {
  limit: number
  offset: number
  onLimitChange: (limit: number) => void
  onOffsetChange: (offset: number) => void
  labels: EntityListPaginationLabels
}

export type EntityListPaginationViewProps = EntityListPaginationProps & {
  total: number
}

export type EntityListProps<TItem> = {
  items: TItem[]
  total: number
  loading?: boolean
  renderItem: (item: TItem) => ReactNode
  filters?: ReactNode
  toolbar?: ReactNode
  gridClassName?: string
  /**
   * Classes da faixa que envolve a grade, a lista vazia e o carregamento.
   *
   * Somam-se às padrão em vez de substituí-las — ao contrário de
   * `gridClassName`, que troca a grade inteira. O uso comum é encostar o
   * espaçamento vertical (`py-6`) quando a lista já vive dentro de um bloco que
   * tem o seu.
   */
  contentClassName?: string
  emptyState?: ReactNode
  pagination?: EntityListPaginationProps
}

export type SearchRecord = Record<string, unknown>

export type UseEntityListSearchOptions<TSearch extends SearchRecord> = {
  path: string
  search: TSearch
}

export type EntityListEmptyProps = {
  children?: ReactNode
}

export type EntityListGridProps = {
  children: ReactNode
  className?: string
}

export type EntityListLoadingProps = {
  count?: number
  gridClassName?: string
}

export type EntityListToolbarProps = {
  filters?: ReactNode
  toolbar?: ReactNode
}
