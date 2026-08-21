// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { accessService } from '../services/access.service'

// Utils
import { isValidBrazilianPlate } from '../utils/plate'

// Types
import type { OpenAccessResponse } from '../types/access.types'

/**
 * Busca os acessos abertos do veículo (conferência na saída —
 * `GET /access/open`).
 *
 * A query é habilitada apenas quando a placa é válida (formato BR) — o
 * porteiro digita a placa e consulta quem está dentro antes de registrar a
 * saída.
 *
 * @param plate Placa (ou `null` para desabilitar).
 * @returns Resultado da conferência.
 */
export function useOpenAccessQuery(plate: string | null) {
  return useQuery({
    queryKey: ['access-open', plate],
    queryFn: () => accessService.getOpenAccess(plate as string),
    enabled: !!plate && isValidBrazilianPlate(plate),
    retry: false,
  })
}

/** Tipo do resultado da conferência (para tipar props). */
export type OpenAccessQueryResult = { data: OpenAccessResponse[] } | undefined
