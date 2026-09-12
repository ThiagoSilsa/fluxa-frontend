// TanStack Query
import { keepPreviousData, useQuery } from '@tanstack/react-query'

// Services
import { accessService } from '../services/access.service'

// Utils
import { isValidBrazilianPlate } from '../utils/plate'

// Types
import type { AccessContextParams, AccessContextResponse } from '../types/access.types'

/**
 * Busca a ficha + veredito da placa (`GET /access/context` — ADR 0014 §2).
 *
 * A query só dispara com placa em formato brasileiro válido. `placeholderData`
 * preserva a ficha anterior enquanto a nova chega — trocar de departamento ou
 * escolher o motorista **não faz a ficha sumir** (evita o "piscar" no balcão).
 *
 * @param params Placa + busca/setor/motorista escolhido (`null` desabilita).
 * @returns Resultado da consulta.
 */
export function useAccessContextQuery(params: AccessContextParams | null) {
  const plate = params?.plate ?? ''
  const search = params?.search ?? null
  const departmentId = params?.departmentId ?? null
  const driverUserId = params?.driverUserId ?? null

  return useQuery({
    queryKey: ['access-context', { plate, search, departmentId, driverUserId }],
    queryFn: () => accessService.getContext(params as AccessContextParams),
    enabled: !!plate && isValidBrazilianPlate(plate),
    placeholderData: keepPreviousData,
    retry: false,
  })
}

/** Tipo do resultado da ficha (para tipar props). */
export type AccessContextQueryResult = AccessContextResponse | undefined
