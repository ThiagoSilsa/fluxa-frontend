import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVehicleTypeMutations } from './use-vehicle-type-mutations'

import type { ReactNode } from 'react'

// Mocks de i18n, toast e service
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'vehicleTypes:notifications.create-success': 'Tipo de veículo criado com sucesso.',
    'vehicleTypes:notifications.update-success': 'Tipo de veículo atualizado com sucesso.',
    'vehicleTypes:notifications.delete-success': 'Tipo de veículo excluído com sucesso.',
  }
  return translations[key] ?? key
})
const mockTc = vi.fn((key: string) => key)

vi.mock('react-i18next', () => ({
  useTranslation: (ns: string | string[]) => {
    const namespace = Array.isArray(ns) ? ns[0] : ns
    return {
      t: (key: string) => {
        if (namespace === 'common') return mockTc(key)
        return mockT(`${namespace}:${key}`)
      },
    }
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}))

// Mock do service
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()
vi.mock('../services/vehicle-type.service', () => ({
  vehicleTypesService: {
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    remove: (...args: unknown[]) => mockRemove(...args),
  },
}))

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// useVehicleTypeMutations
// ---------------------------------------------------------------------------
describe('useVehicleTypeMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createVehicleType', () => {
    it('should call create service and show success toast', async () => {
      mockCreate.mockResolvedValue({ id: 'type-1' })

      const { result } = renderHook(() => useVehicleTypeMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.createVehicleType.mutateAsync({
          code: 'UTILITARIO',
          name: 'Utilitário',
          isFleet: true,
        })
      })

      expect(mockCreate).toHaveBeenCalledWith({
        code: 'UTILITARIO',
        name: 'Utilitário',
        isFleet: true,
      })
      expect(mockToastSuccess).toHaveBeenCalledWith('Tipo de veículo criado com sucesso.')
    })
  })

  describe('updateVehicleType', () => {
    it('should call update service and show success toast', async () => {
      mockUpdate.mockResolvedValue({ id: 'type-1' })

      const { result } = renderHook(() => useVehicleTypeMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.updateVehicleType.mutateAsync({
          vehicleTypeId: 'type-1',
          payload: { name: 'Atualizado', isActive: false },
        })
      })

      expect(mockUpdate).toHaveBeenCalledWith('type-1', {
        name: 'Atualizado',
        isActive: false,
      })
      expect(mockToastSuccess).toHaveBeenCalledWith('Tipo de veículo atualizado com sucesso.')
    })
  })

  describe('deleteVehicleType', () => {
    it('should call remove service and show success toast', async () => {
      mockRemove.mockResolvedValue(undefined)

      const { result } = renderHook(() => useVehicleTypeMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.deleteVehicleType.mutateAsync('type-1')
      })

      expect(mockRemove).toHaveBeenCalledWith('type-1')
      expect(mockToastSuccess).toHaveBeenCalledWith('Tipo de veículo excluído com sucesso.')
    })
  })
})
