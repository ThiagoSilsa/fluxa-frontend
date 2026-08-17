import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUserMutations } from './use-user-mutations'

import type { ReactNode } from 'react'

// Mocks de i18n, toast e service
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    'users:notifications.create-success': 'Usuário criado com sucesso.',
    'users:notifications.update-success': 'Usuário atualizado com sucesso.',
    'users:notifications.delete-success': 'Usuário excluído com sucesso.',
    'users:notifications.password-reset-success': 'Senha redefinida com sucesso.',
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
const mockChangePassword = vi.fn()
vi.mock('../services/user.service', () => ({
  usersService: {
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    remove: (...args: unknown[]) => mockRemove(...args),
    changePassword: (...args: unknown[]) => mockChangePassword(...args),
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
// useUserMutations
// ---------------------------------------------------------------------------
describe('useUserMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createUser', () => {
    it('should call create service and show success toast', async () => {
      mockCreate.mockResolvedValue({ id: 'user-1', createdUser: true })

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.createUser.mutateAsync({
          email: 'novo@somar.local',
          type: 'EMPLOYEE',
          name: 'Novo',
          password: 'senha123',
          roleId: 'role-1',
        })
      })

      expect(mockCreate).toHaveBeenCalledWith({
        email: 'novo@somar.local',
        type: 'EMPLOYEE',
        name: 'Novo',
        password: 'senha123',
        roleId: 'role-1',
      })
      expect(mockToastSuccess).toHaveBeenCalledWith('Usuário criado com sucesso.')
    })

    it('should show error toast on failure', async () => {
      mockCreate.mockRejectedValue(new Error('generic'))

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.createUser
          .mutateAsync({
            email: 'novo@somar.local',
            type: 'EMPLOYEE',
          })
          .catch(() => undefined)
      })

      expect(mockToastError).toHaveBeenCalledWith('errors.generic')
    })
  })

  describe('updateUser', () => {
    it('should call update service and show success toast', async () => {
      mockUpdate.mockResolvedValue({ id: 'user-1' })

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.updateUser.mutateAsync({
          userId: 'user-1',
          payload: { name: 'Atualizado' },
        })
      })

      expect(mockUpdate).toHaveBeenCalledWith('user-1', { name: 'Atualizado' })
      expect(mockToastSuccess).toHaveBeenCalledWith('Usuário atualizado com sucesso.')
    })
  })

  describe('deleteUser', () => {
    it('should call remove service and show success toast', async () => {
      mockRemove.mockResolvedValue(undefined)

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.deleteUser.mutateAsync('user-1')
      })

      expect(mockRemove).toHaveBeenCalledWith('user-1')
      expect(mockToastSuccess).toHaveBeenCalledWith('Usuário excluído com sucesso.')
    })
  })

  describe('changePassword', () => {
    it('should call changePassword service and show success toast', async () => {
      mockChangePassword.mockResolvedValue({})

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.changePassword.mutateAsync({
          userId: 'user-1',
          newPassword: 'novaSenha123',
        })
      })

      expect(mockChangePassword).toHaveBeenCalledWith('user-1', 'novaSenha123')
      expect(mockToastSuccess).toHaveBeenCalledWith('Senha redefinida com sucesso.')
    })
  })
})
