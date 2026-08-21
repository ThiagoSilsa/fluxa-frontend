// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { vehiclesService } from '../services/vehicle.service'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/**
 * Hook que expõe as mutations de QR code de um veículo: emitir, reemitir e
 * revogar.
 *
 * Após sucesso, invalida a query do QR do veículo (a UI reflete o novo
 * estado) e exibe toast de sucesso; em falha, toast de erro padrão
 * (400/403/409/404 traduzidos).
 *
 * @param vehicleId Id do veículo.
 * @returns Objeto com as mutations.
 */
export function useVehicleQrMutations(vehicleId: string) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('vehicles')
  const { t: tc } = useTranslation('common')

  const invalidateQr = () => {
    queryClient.invalidateQueries({ queryKey: ['vehicle-qr', vehicleId] })
  }

  /** Mutation para emitir o QR (primeiro adesivo). */
  const emit = useMutation({
    mutationFn: () => vehiclesService.emitVehicleQr(vehicleId),
    onSuccess: () => {
      invalidateQr()
      toast.success(t('qr.notifications.emit-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para reemitir o QR (adesivo novo — revoga o atual). */
  const reissue = useMutation({
    mutationFn: () => vehiclesService.reissueVehicleQr(vehicleId),
    onSuccess: () => {
      invalidateQr()
      toast.success(t('qr.notifications.reissue-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para revogar o QR ativo (sem emitir outro). */
  const revoke = useMutation({
    mutationFn: () => vehiclesService.revokeVehicleQr(vehicleId),
    onSuccess: () => {
      invalidateQr()
      toast.success(t('qr.notifications.revoke-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return { emit, reissue, revoke }
}
