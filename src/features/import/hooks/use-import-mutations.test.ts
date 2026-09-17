import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useImportMutations } from './use-import-mutations'

import type { ReactNode } from 'react'

// Shared libs
import { ApiError } from '#/shared/lib/api-error'
import i18n from '#/shared/i18n'

// Mocks de i18n e toast
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockT = vi.fn((key: string) => key)

/**
 * Tradução do conjunto comum **de verdade**: o texto do erro é o que a tela
 * mostra, então o teste precisa da tradução real (um `t` de mentira devolveria
 * a chave e o teste passaria sem provar nada).
 */
const commonT = i18n.getFixedT('pt', 'common')

vi.mock('react-i18next', () => ({
  // Forma de módulo de terceiro que o `.use()` do i18next espera (o bootstrap
  // real do i18n é carregado neste teste).
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
const mockUpload = vi.fn()
const service = {
  upload: (...args: unknown[]) => mockUpload(...args),
}

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useImportMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('upload com sucesso: toast de sucesso', async () => {
    mockUpload.mockResolvedValue({ jobId: 'job-1', status: 'PENDING' })

    const { result } = renderHook(
      () => useImportMutations({ service, namespace: 'departmentsImport' }),
      { wrapper: createQueryWrapper() },
    )

    const file = new File(['x'], 'dados.xlsx')
    await act(async () => {
      result.current.uploadCsv.mutateAsync(file)
    })

    expect(mockUpload).toHaveBeenCalledWith(file)
    expect(mockToastSuccess).toHaveBeenCalled()
  })

  it('upload com código de linha antigo (LINHA_{N}_{MSG}): cai no genérico, sem texto cru', async () => {
    mockUpload.mockRejectedValue(
      new ApiError({
        code: 'LINHA_3_NAME_DEVE_TER_ENTRE_2_E_255_CARACTERES',
        message: 'Linha 3: name deve ter entre 2 e 255 caracteres.',
      }),
    )

    const { result } = renderHook(
      () => useImportMutations({ service, namespace: 'departmentsImport' }),
      { wrapper: createQueryWrapper() },
    )

    await act(async () => {
      try {
        await result.current.uploadCsv.mutateAsync(new File(['x'], 'dados.xlsx'))
      } catch {
        // esperado
      }
    })

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Ocorreu um erro inesperado'))
  })

  it('upload com código do catálogo: toast com o texto traduzido', async () => {
    mockUpload.mockRejectedValue(new ApiError({ code: 'A_PLANILHA_ESTA_VAZIA' }))

    const { result } = renderHook(
      () => useImportMutations({ service, namespace: 'departmentsImport' }),
      { wrapper: createQueryWrapper() },
    )

    await act(async () => {
      try {
        await result.current.uploadCsv.mutateAsync(new File(['x'], 'dados.xlsx'))
      } catch {
        // esperado
      }
    })

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('A planilha está vazia.'))
  })

  it('upload com erro sem código: toast genérico', async () => {
    mockUpload.mockRejectedValue(new ApiError({ code: 'CREDENCIAIS_INVALIDAS' }))

    const { result } = renderHook(
      () => useImportMutations({ service, namespace: 'departmentsImport' }),
      { wrapper: createQueryWrapper() },
    )

    await act(async () => {
      try {
        await result.current.uploadCsv.mutateAsync(new File(['x'], 'dados.xlsx'))
      } catch {
        // esperado
      }
    })

    expect(mockToastError).toHaveBeenCalled()
  })
})
