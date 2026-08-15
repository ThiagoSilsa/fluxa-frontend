import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { SearchRecord, UseEntityListSearchOptions } from '../types/entity-list.types'

function cleanSearch<TSearch extends SearchRecord>(search: TSearch) {
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
 * Sincroniza `offset`/`limit` (e filtros) com os search params da URL.
 *
 * `updateSearch` (busca/filtros) reseta o offset para 0; `updatePagination`
 * preserva o offset. Usado com listagens paginadas (`EntityList`).
 *
 * @param options Caminho da rota e search params atuais.
 * @returns Leituras e updaters de paginação/busca.
 */
export function useEntityListSearch<TSearch extends SearchRecord>({
  path,
  search,
}: UseEntityListSearchOptions<TSearch>) {
  const navigate = useNavigate()

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
    (offset: number) => updatePagination({ offset } as unknown as Partial<TSearch>),
    [updatePagination],
  )

  const updateLimit = useCallback(
    (limit: number) => updateSearchParams({ limit } as unknown as Partial<TSearch>, true),
    [updateSearchParams],
  )

  return {
    limit: search.limit as number | undefined,
    offset: search.offset as number | undefined,
    updateSearch,
    updatePagination,
    updateOffset,
    updateLimit,
  }
}
