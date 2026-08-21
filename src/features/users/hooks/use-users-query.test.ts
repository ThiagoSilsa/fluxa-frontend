import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUsersQuery } from './use-users-query'

import type { ReactNode } from 'react'

// Mock do service
const mockList = vi.fn()
vi.mock('../services/user.service', () => ({
  usersService: { list: (...args: unknown[]) => mockList(...args) },
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
// useUsersQuery
// ---------------------------------------------------------------------------
describe('useUsersQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return isLoading initially', () => {
    mockList.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useUsersQuery({ limit: 20, offset: 0 }), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should return the paginated envelope on success', async () => {
    const mockResponse = { limit: 20, offset: 0, data: [], count: 0 }
    mockList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useUsersQuery({ limit: 20, offset: 0 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
    expect(mockList).toHaveBeenCalledWith({ limit: 20, offset: 0 })
  })

  it('should pass search, filters and pagination to the service', async () => {
    mockList.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

    renderHook(
      () =>
        useUsersQuery({
          search: 'mar',
          type: 'VISITOR',
          isActive: false,
          limit: 10,
          offset: 20,
        }),
      { wrapper: createQueryWrapper() },
    )

    await waitFor(() => expect(mockList).toHaveBeenCalled())

    expect(mockList).toHaveBeenCalledWith({
      search: 'mar',
      type: 'VISITOR',
      isActive: false,
      limit: 10,
      offset: 20,
    })
  })
})
