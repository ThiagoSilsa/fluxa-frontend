// React
import { useCallback, useMemo } from 'react'

// Router
import { useNavigate } from '@tanstack/react-router'

// Types
import type { SortingState } from '@tanstack/react-table'
import type { UseGenericTableSearchOptions } from '../types/generic-table.types'

function cleanSearch<TSearch extends Record<string, unknown>>(search: TSearch) {
  const entries = Object.entries(search).filter(([, value]) => {
    if (value === undefined || value === null) {
      return false
    }

    if (typeof value === 'string') {
      return value.trim().length > 0
    }

    return true
  })

  return Object.fromEntries(entries) as TSearch
}

/**
 * Sincroniza paginação (`limit`/`offset`) e ordenação (`sortBy`/`sortOrder`)
 * com os search params da URL, no formato do TanStack Table
 * (`pageIndex`/`pageSize`/`sorting`).
 *
 * Busca/filtros e mudança de ordenação resetam o offset para 0.
 *
 * @param options Caminho da rota e search params atuais.
 * @returns Leituras e updaters no formato do TanStack Table.
 */
export function useGenericTableSearch<TSearch extends Record<string, unknown>>({
  path,
  search,
}: UseGenericTableSearchOptions<TSearch>) {
  const navigate = useNavigate()

  const limit = search.limit as number | undefined
  const offset = search.offset as number | undefined
  const sortBy = search.sortBy as string | undefined
  const sortOrder = search.sortOrder as 'asc' | 'desc' | undefined

  const pageSize = limit ?? 10
  const pageIndex = offset ? Math.floor(offset / pageSize) : 0

  // --- Sorting state for TanStack Table ---
  const sorting: SortingState = useMemo(
    () => (sortBy && sortOrder ? [{ id: sortBy, desc: sortOrder.toUpperCase() === 'DESC' }] : []),
    [sortBy, sortOrder],
  )

  const updateSearchParams = useCallback(
    (next: Partial<TSearch>, resetOffset: boolean) => {
      navigate({
        to: path,
        search: (previous) => {
          const merged = {
            ...previous,
            ...next,
            ...(resetOffset ? { offset: 0 } : {}),
          } as TSearch

          return cleanSearch(merged)
        },
      })
    },
    [navigate, path],
  )

  const updateSearch = useCallback(
    (next: Partial<TSearch>) => updateSearchParams(next, true),
    [updateSearchParams],
  )

  const updatePagination = useCallback(
    (next: Partial<TSearch>) => updateSearchParams(next, false),
    [updateSearchParams],
  )

  const updateOffset = useCallback(
    (newOffset: number) => updatePagination({ offset: newOffset } as unknown as Partial<TSearch>),
    [updatePagination],
  )

  const updateLimit = useCallback(
    (newLimit: number) =>
      updateSearchParams({ limit: newLimit } as unknown as Partial<TSearch>, true),
    [updateSearchParams],
  )

  const onPageChange = useCallback(
    (page: number) => {
      const newOffset = page * pageSize
      updateOffset(newOffset)
    },
    [updateOffset, pageSize],
  )

  const onPageSizeChange = useCallback((size: number) => updateLimit(size), [updateLimit])

  // --- Sorting handler: writes sortBy/sortOrder to URL and resets offset ---
  const onSortingChange = useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater

      if (newSorting.length > 0) {
        const sort = newSorting[0]
        updateSearchParams(
          {
            sortBy: sort.id,
            sortOrder: sort.desc ? 'DESC' : 'ASC',
          } as unknown as Partial<TSearch>,
          true, // reseta offset para 0
        )
      } else {
        updateSearchParams(
          {
            sortBy: undefined,
            sortOrder: undefined,
          } as unknown as Partial<TSearch>,
          true, // reseta offset para 0
        )
      }
    },
    [sorting, updateSearchParams],
  )

  return {
    limit,
    offset,
    pageIndex,
    pageSize,
    sortBy,
    sortOrder,
    sorting,
    updateSearch,
    updatePagination,
    updateOffset,
    updateLimit,
    onPageChange,
    onPageSizeChange,
    onSortingChange,
  }
}
