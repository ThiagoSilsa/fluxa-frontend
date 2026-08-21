import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useImportMutations } from './use-import-mutations'

// Shared libs
import { ApiError } from '#/shared/lib/api-error'

import type { ReactNode } from 'react'

// Mocks de i18n, toast e service
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
const mockT = vi.fn((key: string) => key)
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

const mockUpload = vi.fn()
vi.mock('../services/departments-import.service', () => ({
  departmentsImportService: { upload: (...args: unknown[]) => mockUpload(...args) },
}))

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

    const { result } = renderHook(() => useImportMutations(), {
      wrapper: createQueryWrapper(),
    })

    const file = new File(['x'], 'dados.xlsx')
    await act(async () => {
      result.current.uploadCsv.mutateAsync(file)
    })

    expect(mockUpload).toHaveBeenCalledWith(file)
    expect(mockToastSuccess).toHaveBeenCalled()
  })

  it('upload com erro por linha (LINHA_{N}_{MSG}): toast com a linha', async () => {
    mockUpload.mockRejectedValue(
      new ApiError({
        code: 'LINHA_3_NAME_DEVE_TER_ENTRE_2_E_255_CARACTERES',
        message: 'Linha 3: name deve ter entre 2 e 255 caracteres.',
      }),
    )

    const { result } = renderHook(() => useImportMutations(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      try {
        await result.current.uploadCsv.mutateAsync(new File(['x'], 'dados.xlsx'))
      } catch {
        // esperado
      }
    })

    expect(mockToastError).toHaveBeenCalledWith(expect.stringContaining('3'))
    await waitFor(() => expect(mockToastError).toHaveBeenCalled())
  })

  it('upload com erro genérico: toast via mapa de códigos', async () => {
    mockUpload.mockRejectedValue(new ApiError({ code: 'CREDENCIAIS_INVALIDAS' }))

    const { result } = renderHook(() => useImportMutations(), {
      wrapper: createQueryWrapper(),
    })

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
