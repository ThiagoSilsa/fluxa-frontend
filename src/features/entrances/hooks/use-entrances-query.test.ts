import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEntrancesQuery } from './use-entrances-query'

// Types
import type { EntranceListParams } from '../types/entrances.types'

import type { ReactNode } from 'react'

// Mock do service
const mockList = vi.fn()
vi.mock('../services/entrance.service', () => ({
  entrancesService: { list: (...args: unknown[]) => mockList(...args) },
}))

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// useEntrancesQuery
// ---------------------------------------------------------------------------
describe('useEntrancesQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return isLoading initially', () => {
    mockList.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useEntrancesQuery({}), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should return the paginated envelope on success', async () => {
    const mockResponse = {
      limit: 20,
      offset: 0,
      data: [
        { id: 'ent-1', name: 'Portaria Principal', isActive: true },
        { id: 'ent-2', name: 'Portaria Secundária', isActive: true },
      ],
      count: 2,
    }
    mockList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useEntrancesQuery({}), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
    expect(mockList).toHaveBeenCalledWith({})
  })

  it('should pass search, limit and offset to the service', async () => {
    mockList.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

    renderHook(() => useEntrancesQuery({ search: 'Principal', limit: 20, offset: 40 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(mockList).toHaveBeenCalled())

    expect(mockList).toHaveBeenCalledWith({ search: 'Principal', limit: 20, offset: 40 })
  })

  it('should refetch when isActive filter changes (different query key)', async () => {
    mockList.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

    const { rerender } = renderHook(
      ({ params }: { params: EntranceListParams }) => useEntrancesQuery(params),
      {
        initialProps: { params: { isActive: true } },
        wrapper: createQueryWrapper(),
      },
    )

    await waitFor(() => expect(mockList).toHaveBeenCalledWith({ isActive: true }))

    rerender({ params: { isActive: false } })

    await waitFor(() => expect(mockList).toHaveBeenCalledWith({ isActive: false }))
  })
})
