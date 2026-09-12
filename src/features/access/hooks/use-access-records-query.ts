// TanStack Query
import { keepPreviousData, useQuery } from '@tanstack/react-query'

// Services
import { accessService } from '../services/access.service'

// Types
import type { AccessRecordsParams, AccessRecordsResponse } from '../types/access.types'

/** Intervalo de atualização do feed (ms) — a lista reflete outros dispositivos. */
export const ACCESS_RECORDS_REFETCH_INTERVAL = 15_000

/**
 * Busca o feed de registros da portaria (`GET /access/records` — ADR 0015).
 *
 * O servidor já entrega ordenado (`occurredAt DESC`); o polling curto mantém a
 * lista viva com o que outro dispositivo registrou, e `placeholderData` evita
 * limpar a tabela a cada mudança de filtro/página.
 *
 * @param params Filtros + paginação.
 * @returns Resultado da consulta.
 */
export function useAccessRecordsQuery(params: AccessRecordsParams) {
  return useQuery({
    queryKey: ['access-records', params],
    queryFn: () => accessService.listRecords(params),
    refetchInterval: ACCESS_RECORDS_REFETCH_INTERVAL,
    placeholderData: keepPreviousData,
  })
}

/** Tipo do resultado do feed (para tipar props/colunas). */
export type AccessRecordsQueryResult = AccessRecordsResponse | undefined
