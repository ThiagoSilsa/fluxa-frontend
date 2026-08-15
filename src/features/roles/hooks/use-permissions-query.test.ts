import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePermissionsQuery } from './use-permissions-query'

import type { ReactNode } from 'react'

// Mock do service
const mockList = vi.fn()
vi.mock('../services/role.service', () => ({
  permissionsService: { list: (...args: unknown[]) => mockList(...args) },
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
// usePermissionsQuery
// ---------------------------------------------------------------------------
describe('usePermissionsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return isLoading initially', () => {
    mockList.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => usePermissionsQuery(), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should return permissions list on success', async () => {
    const mockResponse = [
      { id: 'perm-1', code: 'VIEW_DASHBOARDS', description: 'Ver painéis' },
      { id: 'perm-2', code: 'MANAGE_USERS', description: 'Gerenciar usuários' },
    ]
    mockList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => usePermissionsQuery(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
    expect(mockList).toHaveBeenCalledOnce()
  })
})
