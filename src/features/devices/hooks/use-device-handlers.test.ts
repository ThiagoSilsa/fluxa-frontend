import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDeviceHandlers } from './use-device-handlers'

// Types
import type { DeviceEntity } from '../types/devices.types'

// Schemas
import type { DeviceFormValues } from '../schemas/device.schema'

// ---------------------------------------------------------------------------
// useDeviceHandlers
// ---------------------------------------------------------------------------
describe('useDeviceHandlers', () => {
  const createDevice = { mutateAsync: vi.fn() }
  const updateDevice = { mutateAsync: vi.fn() }
  const deleteDevice = { mutateAsync: vi.fn() }
  const rotateToken = { mutateAsync: vi.fn() }

  const defaultParams = {
    updateSearch: vi.fn(),
    search: { isActive: undefined },
    createDevice,
    updateDevice,
    deleteDevice,
    rotateToken,
  }

  const device: DeviceEntity = {
    id: 'device-1',
    name: 'Tablet Portaria 1',
    platform: 'ANDROID',
    appVersion: null,
    entranceId: 'entrance-1',
    entrance: { id: 'entrance-1', name: 'Portaria Principal' },
    lastSyncAt: null,
    isActive: true,
    createdAt: '2026-08-21T00:00:00.000Z',
    updatedAt: '2026-08-21T00:00:00.000Z',
  }

  const formValues: DeviceFormValues = {
    name: 'Tablet Portaria 1',
    platform: 'ANDROID',
    entranceId: 'entrance-1',
    isActive: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // -----------------------------------------------------------------------
  // Filtros
  // -----------------------------------------------------------------------
  describe('filters', () => {
    it('mapeia search.isActive para statusValue e atualiza na mudança', () => {
      const { result } = renderHook(() => useDeviceHandlers(defaultParams))

      expect(result.current.statusValue).toBe('all')

      act(() => result.current.handleStatusChange('active'))
      expect(defaultParams.updateSearch).toHaveBeenCalledWith({ isActive: true })

      act(() => result.current.handleStatusChange('inactive'))
      expect(defaultParams.updateSearch).toHaveBeenCalledWith({ isActive: false })

      act(() => result.current.handleStatusChange('all'))
      expect(defaultParams.updateSearch).toHaveBeenCalledWith({ isActive: undefined })
    })

    it('reflete search.isActive=false como inactive', () => {
      const { result } = renderHook(() =>
        useDeviceHandlers({ ...defaultParams, search: { isActive: false } }),
      )
      expect(result.current.statusValue).toBe('inactive')
    })
  })

  // -----------------------------------------------------------------------
  // Criação
  // -----------------------------------------------------------------------
  describe('handleSubmitForm (create)', () => {
    it('abre o dialog de token com o token gerado pelo backend', async () => {
      const result = { device, token: 'a'.repeat(32) }
      createDevice.mutateAsync.mockResolvedValue(result)

      const { result: hook } = renderHook(() => useDeviceHandlers(defaultParams))

      act(() => hook.current.handleOpenCreate())

      await act(async () => {
        await hook.current.handleSubmitForm(formValues)
      })

      expect(createDevice.mutateAsync).toHaveBeenCalledWith({
        name: 'Tablet Portaria 1',
        platform: 'ANDROID',
        entranceId: 'entrance-1',
      })
      expect(hook.current.tokenTarget).toEqual(result)
      expect(hook.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Edição
  // -----------------------------------------------------------------------
  describe('handleSubmitForm (edit)', () => {
    it('envia apenas o diff e fecha o formulário', async () => {
      updateDevice.mutateAsync.mockResolvedValue(device)

      const { result: hook } = renderHook(() => useDeviceHandlers(defaultParams))

      act(() => hook.current.handleOpenEdit(device))

      await act(async () => {
        await hook.current.handleSubmitForm({ ...formValues, name: 'Tablet Renomeado' })
      })

      expect(updateDevice.mutateAsync).toHaveBeenCalledWith({
        deviceId: 'device-1',
        payload: { name: 'Tablet Renomeado' },
      })
      expect(hook.current.formState).toBeNull()
      expect(hook.current.tokenTarget).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Rotação de token
  // -----------------------------------------------------------------------
  describe('handleConfirmRotate', () => {
    it('rotaciona e abre o dialog de token com o novo token', async () => {
      const result = { device, token: 'b'.repeat(32) }
      rotateToken.mutateAsync.mockResolvedValue(result)

      const { result: hook } = renderHook(() => useDeviceHandlers(defaultParams))

      act(() => hook.current.handleOpenRotate(device))
      expect(hook.current.rotateTarget).toEqual({ id: device.id, name: device.name })

      await act(async () => {
        await hook.current.handleConfirmRotate()
      })

      expect(rotateToken.mutateAsync).toHaveBeenCalledWith(device.id)
      expect(hook.current.tokenTarget).toEqual(result)
      expect(hook.current.rotateTarget).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Exclusão
  // -----------------------------------------------------------------------
  describe('handleConfirmDelete', () => {
    it('exclui o dispositivo e limpa o target', async () => {
      deleteDevice.mutateAsync.mockResolvedValue(undefined)

      const { result: hook } = renderHook(() => useDeviceHandlers(defaultParams))

      act(() => hook.current.setDeleteTarget({ id: device.id, name: device.name }))

      await act(async () => {
        await hook.current.handleConfirmDelete()
      })

      expect(deleteDevice.mutateAsync).toHaveBeenCalledWith(device.id)
      expect(hook.current.deleteTarget).toBeNull()
    })
  })
})
