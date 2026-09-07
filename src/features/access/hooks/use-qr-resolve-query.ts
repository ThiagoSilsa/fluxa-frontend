// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { accessService } from '../services/access.service'

// Types
import type { ResolvedVehicleQr } from '../types/access.types'

/**
 * Resolve o QR code (token permanente do veículo) em dados do veículo —
 * `GET /qr-codes/:code`.
 *
 * @param code Token do QR (ou `null` para desabilitar).
 * @returns Veículo resolvido pelo QR.
 */
export function useQrResolveQuery(code: string | null) {
  return useQuery({
    queryKey: ['access-qr-resolve', code],
    queryFn: () => accessService.resolveQr(code as string),
    enabled: !!code,
    retry: false,
  })
}

/** Tipo do veículo resolvido (para tipar props). */
export type QrResolveResult = ResolvedVehicleQr | undefined
