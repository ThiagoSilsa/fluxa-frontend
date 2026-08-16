import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRoleOptions } from './use-role-options'

import type { ReactNode } from 'react'

// Mock do service
const mockListRoles = vi.fn()
vi.mock('../services/user.service', () => ({
  usersService: { listRoles: (...args: unknown[]) => mockListRoles(...args) },
}))

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const CATALOG = [
  { id: 'r1', name: 'Porteiro', isAdmin: false, isActive: true },
  { id: 'r2', name: 'Inativo', isAdmin: false, isActive: false },
  { id: 'r3', name: 'Administração', isAdmin: true, isActive: true },
]

// ---------------------------------------------------------------------------
// useRoleOptions
// ---------------------------------------------------------------------------
describe('useRoleOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return only active roles for an admin', async () => {
    mockListRoles.mockResolvedValue(CATALOG)

    const { result } = renderHook(() => useRoleOptions(true), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.length).toBe(2))
    expect(result.current.map((role) => role.id)).toEqual(['r1', 'r3'])
  })

  it('should hide admin roles for a non-admin', async () => {
    mockListRoles.mockResolvedValue(CATALOG)

    const { result } = renderHook(() => useRoleOptions(false), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.length).toBe(1))
    expect(result.current[0].id).toBe('r1')
  })
})
