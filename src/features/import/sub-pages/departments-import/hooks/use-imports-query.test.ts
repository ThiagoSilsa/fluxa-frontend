import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useImportsQuery } from './use-imports-query'

import type { ReactNode } from 'react'

// Mock do service
const mockList = vi.fn()
vi.mock('../services/departments-import.service', () => ({
  departmentsImportService: { list: (...args: unknown[]) => mockList(...args) },
}))

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useImportsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devolve o envelope paginado de jobs', async () => {
    const mockResponse = {
      limit: 20,
      offset: 0,
      count: 1,
      data: [
        {
          id: 'job-1',
          type: 'DEPARTMENT',
          status: 'DONE',
          totalRows: 3,
          processedRows: 3,
          successCount: 3,
          errorCount: 0,
          errorMessage: null,
          fileName: 'departamentos.xlsx',
          createdAt: '2026-08-20T10:00:00.000Z',
          startedAt: null,
          completedAt: null,
        },
      ],
    }
    mockList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useImportsQuery({ limit: 20, offset: 0 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockList).toHaveBeenCalledWith({ limit: 20, offset: 0 })
    expect(result.current.data?.count).toBe(1)
    expect(result.current.data?.data[0].fileName).toBe('departamentos.xlsx')
  })

  it('usa a chave de query [imports, params]', async () => {
    mockList.mockResolvedValue({ limit: 20, offset: 0, count: 0, data: [] })

    const { result } = renderHook(() => useImportsQuery({ limit: 10, offset: 5 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockList).toHaveBeenCalledWith({ limit: 10, offset: 5 })
  })
})
