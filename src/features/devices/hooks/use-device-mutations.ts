// TanStack Query
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Toast
import { toast } from 'sonner'

// i18n
import { useTranslation } from 'react-i18next'

// Services
import { devicesService } from '../services/device.service'

// Types
import type { CreateDevicePayload, UpdateDevicePayload } from '../types/devices.types'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/**
 * Hook que expõe as mutations de dispositivo: criar, atualizar, excluir e
 * rotacionar o token.
 *
 * Após sucesso, invalida a lista de dispositivos e exibe toast de sucesso;
 * em falha, toast de erro padrão (400/403/404/409 traduzidos). As respostas
 * de criação/rotação devolvem o token write-only (exibido uma única vez pelo
 * caller).
 *
 * @returns Objeto com todas as mutations.
 */
export function useDeviceMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('devices')
  const { t: tc } = useTranslation('common')

  const invalidateDevices = () => {
    queryClient.invalidateQueries({ queryKey: ['devices'] })
  }

  /** Mutation para criar um novo dispositivo. */
  const createDevice = useMutation({
    mutationFn: (payload: CreateDevicePayload) => devicesService.create(payload),
    onSuccess: () => {
      invalidateDevices()
      toast.success(t('notifications.create-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para atualizar um dispositivo existente. */
  const updateDevice = useMutation({
    mutationFn: ({ deviceId, payload }: { deviceId: string; payload: UpdateDevicePayload }) =>
      devicesService.update(deviceId, payload),
    onSuccess: () => {
      invalidateDevices()
      toast.success(t('notifications.update-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para excluir fisicamente um dispositivo (DELETE = 204). */
  const deleteDevice = useMutation({
    mutationFn: (deviceId: string) => devicesService.remove(deviceId),
    onSuccess: () => {
      invalidateDevices()
      toast.success(t('notifications.delete-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  /** Mutation para rotacionar o token de um dispositivo. */
  const rotateToken = useMutation({
    mutationFn: (deviceId: string) => devicesService.rotateToken(deviceId),
    onSuccess: () => {
      invalidateDevices()
      toast.success(t('notifications.rotate-success'))
    },
    onError: (error) => {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    },
  })

  return { createDevice, updateDevice, deleteDevice, rotateToken }
}
