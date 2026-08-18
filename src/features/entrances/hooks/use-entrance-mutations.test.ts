import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEntranceMutations } from './use-entrance-mutations'

import type { ReactNode } from 'react'

// Mocks de i18n, toast e service
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'entrances:notifications.create-success': 'Portaria criada com sucesso.',
    'entrances:notifications.update-success': 'Portaria atualizada com sucesso.',
    'entrances:notifications.delete-success': 'Portaria excluída com sucesso.',
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
vi.mock('../services/entrance.service', () => ({
  entrancesService: {
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
// useEntranceMutations
// ---------------------------------------------------------------------------
describe('useEntranceMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createEntrance', () => {
    it('should call create service and show success toast', async () => {
      mockCreate.mockResolvedValue({ id: 'ent-1' })

      const { result } = renderHook(() => useEntranceMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.createEntrance.mutateAsync({
          name: 'Portaria Principal',
        })
      })

      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Portaria Principal',
      })
      expect(mockToastSuccess).toHaveBeenCalledWith('Portaria criada com sucesso.')
    })
  })

  describe('updateEntrance', () => {
    it('should call update service and show success toast', async () => {
      mockUpdate.mockResolvedValue({ id: 'ent-1' })

      const { result } = renderHook(() => useEntranceMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.updateEntrance.mutateAsync({
          entranceId: 'ent-1',
          payload: { name: 'Atualizada', isActive: false },
        })
      })

      expect(mockUpdate).toHaveBeenCalledWith('ent-1', {
        name: 'Atualizada',
        isActive: false,
      })
      expect(mockToastSuccess).toHaveBeenCalledWith('Portaria atualizada com sucesso.')
    })
  })

  describe('deleteEntrance', () => {
    it('should call remove service and show success toast', async () => {
      mockRemove.mockResolvedValue(undefined)

      const { result } = renderHook(() => useEntranceMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.deleteEntrance.mutateAsync('ent-1')
      })

      expect(mockRemove).toHaveBeenCalledWith('ent-1')
      expect(mockToastSuccess).toHaveBeenCalledWith('Portaria excluída com sucesso.')
    })
  })
})
