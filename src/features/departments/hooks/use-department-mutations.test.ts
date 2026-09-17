import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDepartmentMutations } from './use-department-mutations'

import { ApiError } from '#/shared/lib/api-error'
import i18n from '#/shared/i18n'

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

/**
 * Tradução do conjunto comum **de verdade**: o texto do erro de validação é o
 * que o usuário lê, então o caminho completo precisa da tradução real (um `t`
 * de mentira devolveria a chave e o teste passaria sem provar nada).
 */
const commonT = i18n.getFixedT('pt', 'common')

vi.mock('react-i18next', () => ({
  // Forma de módulo de terceiro que o `.use()` do i18next espera: o bootstrap
  // real (`#/shared/i18n`) é carregado neste teste por causa da tradução de
  // verdade do conjunto comum.
  initReactI18next: { type: '3rdParty', init: () => undefined },
  useTranslation: (ns: string | string[]) => {
    const namespace = Array.isArray(ns) ? ns[0] : ns
    return {
      t: (key: string, params?: Record<string, unknown>) => {
        if (namespace === 'common') return commonT(key, params)
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

  describe('erro de validação', () => {
    it('mostra o campo e a regra num toast só, no idioma ativo', async () => {
      mockCreate.mockRejectedValue(
        new ApiError({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'Texto do servidor que não deve aparecer.',
          details: [
            { field: 'email', code: 'INVALID_EMAIL' },
            { field: 'parkingSpace', code: 'MIN_VALUE', params: { min: 0 } },
          ],
        }),
      )

      const { result } = renderHook(() => useDepartmentMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.createDepartment
          .mutateAsync({ name: 'Recepção', parkingSpace: 30 })
          .catch(() => undefined)
      })

      expect(mockToastError).toHaveBeenCalledTimes(1)
      expect(mockToastError).toHaveBeenCalledWith(
        'E-mail: formato de e-mail inválido · Vagas: valor mínimo: 0',
      )
    })

    it('sem details mantém o genérico de validação traduzido', async () => {
      mockCreate.mockRejectedValue(new ApiError({ statusCode: 400, message: 'Erro de validação' }))

      const { result } = renderHook(() => useDepartmentMutations(), {
        wrapper: createQueryWrapper(),
      })

      await act(async () => {
        await result.current.createDepartment
          .mutateAsync({ name: 'Recepção', parkingSpace: 30 })
          .catch(() => undefined)
      })

      expect(mockToastError).toHaveBeenCalledWith('Erro de validação')
    })
  })
})
