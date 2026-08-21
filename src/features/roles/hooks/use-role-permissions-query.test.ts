import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRolePermissionsQuery } from './use-role-permissions-query'

import type { ReactNode } from 'react'

// Mock do service
const mockListRolePermissions = vi.fn()
vi.mock('../services/role.service', () => ({
  rolesService: { listRolePermissions: (...args: unknown[]) => mockListRolePermissions(...args) },
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
// useRolePermissionsQuery
// ---------------------------------------------------------------------------
describe('useRolePermissionsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not fetch when roleId is null (disabled)', () => {
    const { result } = renderHook(() => useRolePermissionsQuery(null), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isPending).toBe(true)
    expect(mockListRolePermissions).not.toHaveBeenCalled()
  })

  it('should return role permissions on success', async () => {
    const mockResponse = {
      roleId: 'role-1',
      permissions: [{ id: 'perm-1', code: 'VIEW_DASHBOARDS', description: 'Ver painéis' }],
      available: [
        { id: 'perm-1', code: 'VIEW_DASHBOARDS', description: 'Ver painéis' },
        { id: 'perm-2', code: 'MANAGE_USERS', description: 'Gerenciar usuários' },
      ],
    }
    mockListRolePermissions.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useRolePermissionsQuery('role-1'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
    expect(mockListRolePermissions).toHaveBeenCalledWith('role-1')
  })
})
