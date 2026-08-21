import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDepartmentMutations } from './use-department-mutations'

import type { ReactNode } from 'react'

// Mocks de i18n, toast e service
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'departments:notifications.create-success': 'Departamento criado com sucesso.',
    'departments:notifications.update-success': 'Departamento atualizado com sucesso.',
    'departments:notifications.delete-success': 'Departamento excluído com sucesso.',
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
vi.mock('../services/department.service', () => ({
  departmentsService: {
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
// useDepartmentMutations
// ---------------------------------------------------------------------------
describe('useDepartmentMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createDepartment', () => {
    it('should call create service and show success toast', async () => {
      mockCreate.mockResolvedValue({ id: 'dept-1' })

      const { result } = renderHook(() => useDepartmentMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.createDepartment.mutateAsync({
          name: 'Recepção',
          parkingSpace: 30,
        })
      })

      expect(mockCreate).toHaveBeenCalledWith({
        name: 'Recepção',
        parkingSpace: 30,
      })
      expect(mockToastSuccess).toHaveBeenCalledWith('Departamento criado com sucesso.')
    })
  })

  describe('updateDepartment', () => {
    it('should call update service and show success toast', async () => {
      mockUpdate.mockResolvedValue({ id: 'dept-1' })

      const { result } = renderHook(() => useDepartmentMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.updateDepartment.mutateAsync({
          departmentId: 'dept-1',
          payload: { name: 'Atualizado', isActive: false },
        })
      })

      expect(mockUpdate).toHaveBeenCalledWith('dept-1', {
        name: 'Atualizado',
        isActive: false,
      })
      expect(mockToastSuccess).toHaveBeenCalledWith('Departamento atualizado com sucesso.')
    })
  })

  describe('deleteDepartment', () => {
    it('should call remove service and show success toast', async () => {
      mockRemove.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDepartmentMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.deleteDepartment.mutateAsync('dept-1')
      })

      expect(mockRemove).toHaveBeenCalledWith('dept-1')
      expect(mockToastSuccess).toHaveBeenCalledWith('Departamento excluído com sucesso.')
    })
  })
})
