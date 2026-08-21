import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRoleMutations } from './use-role-mutations'

import type { ReactNode } from 'react'

// Mocks de i18n, toast e service
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'roles:notifications.create-success': 'Cargo criado com sucesso.',
    'roles:notifications.update-success': 'Cargo atualizado com sucesso.',
    'roles:notifications.delete-success': 'Cargo excluído com sucesso.',
    'roles:notifications.permission-assigned': 'Permissão concedida.',
    'roles:notifications.permission-removed': 'Permissão removida.',
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
const mockAssignPermission = vi.fn()
const mockRemovePermission = vi.fn()
vi.mock('../services/role.service', () => ({
  rolesService: {
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    remove: (...args: unknown[]) => mockRemove(...args),
    assignPermission: (...args: unknown[]) => mockAssignPermission(...args),
    removePermission: (...args: unknown[]) => mockRemovePermission(...args),
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
// useRoleMutations
// ---------------------------------------------------------------------------
describe('useRoleMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createRole', () => {
    it('should call create service and show success toast', async () => {
      mockCreate.mockResolvedValue({ id: 'role-1' })

      const { result } = renderHook(() => useRoleMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.createRole.mutateAsync({
          name: 'Novo Cargo',
          description: 'Descrição',
        })
      })

      expect(mockCreate).toHaveBeenCalledWith({ name: 'Novo Cargo', description: 'Descrição' })
      expect(mockToastSuccess).toHaveBeenCalledWith('Cargo criado com sucesso.')
    })
  })

  describe('updateRole', () => {
    it('should call update service and show success toast', async () => {
      mockUpdate.mockResolvedValue({ id: 'role-1' })

      const { result } = renderHook(() => useRoleMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.updateRole.mutateAsync({
          roleId: 'role-1',
          payload: { name: 'Atualizado' },
        })
      })

      expect(mockUpdate).toHaveBeenCalledWith('role-1', { name: 'Atualizado' })
      expect(mockToastSuccess).toHaveBeenCalledWith('Cargo atualizado com sucesso.')
    })
  })

  describe('deleteRole', () => {
    it('should call remove service and show success toast', async () => {
      mockRemove.mockResolvedValue(undefined)

      const { result } = renderHook(() => useRoleMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.deleteRole.mutateAsync('role-1')
      })

      expect(mockRemove).toHaveBeenCalledWith('role-1')
      expect(mockToastSuccess).toHaveBeenCalledWith('Cargo excluído com sucesso.')
    })
  })

  describe('assignPermission', () => {
    it('should call assignPermission service and show success toast', async () => {
      mockAssignPermission.mockResolvedValue({})

      const { result } = renderHook(() => useRoleMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.assignPermission.mutateAsync({
          roleId: 'role-1',
          permissionId: 'perm-1',
        })
      })

      expect(mockAssignPermission).toHaveBeenCalledWith('role-1', { permissionId: 'perm-1' })
      expect(mockToastSuccess).toHaveBeenCalledWith('Permissão concedida.')
    })
  })

  describe('removePermission', () => {
    it('should call removePermission service and show success toast', async () => {
      mockRemovePermission.mockResolvedValue({})

      const { result } = renderHook(() => useRoleMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.removePermission.mutateAsync({
          roleId: 'role-1',
          permissionId: 'perm-1',
        })
      })

      expect(mockRemovePermission).toHaveBeenCalledWith('role-1', 'perm-1')
      expect(mockToastSuccess).toHaveBeenCalledWith('Permissão removida.')
    })
  })
})
