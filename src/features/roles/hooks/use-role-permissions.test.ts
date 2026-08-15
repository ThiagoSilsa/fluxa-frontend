import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRolePermissions } from './use-role-permissions'

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

// Mock do service
const mockListRolePermissions = vi.fn()
const mockAssignPermission = vi.fn()
const mockRemovePermission = vi.fn()
vi.mock('../services/role.service', () => ({
  rolesService: {
    listRolePermissions: (...args: unknown[]) => mockListRolePermissions(...args),
    assignPermission: (...args: unknown[]) => mockAssignPermission(...args),
    removePermission: (...args: unknown[]) => mockRemovePermission(...args),
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

const PERMISSION = { id: 'perm-1', code: 'VIEW_DASHBOARDS', description: 'Ver painéis' }

const ROLE_PERMISSIONS_RESPONSE = {
  roleId: 'role-1',
  permissions: [PERMISSION],
  available: [
    PERMISSION,
    { id: 'perm-2', code: 'MANAGE_USERS', description: 'Gerenciar usuários' },
  ],
}

// ---------------------------------------------------------------------------
// useRolePermissions
// ---------------------------------------------------------------------------
describe('useRolePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListRolePermissions.mockResolvedValue(ROLE_PERMISSIONS_RESPONSE)
  })

  it('should return permissions, available and assigned ids', async () => {
    const { result } = renderHook(() => useRolePermissions('role-1'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.permissions).toEqual([PERMISSION])
    expect(result.current.available).toEqual(ROLE_PERMISSIONS_RESPONSE.available)
    expect(result.current.assignedIds.has('perm-1')).toBe(true)
    expect(result.current.assignedIds.has('perm-2')).toBe(false)
  })

  it('should remove permission when it is already assigned', async () => {
    mockRemovePermission.mockResolvedValue({})

    const { result } = renderHook(() => useRolePermissions('role-1'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleToggle(PERMISSION)
    })

    expect(mockRemovePermission).toHaveBeenCalledWith('role-1', 'perm-1')
    expect(mockAssignPermission).not.toHaveBeenCalled()
    expect(result.current.pendingPermissionId).toBeNull()
  })

  it('should assign permission when it is not assigned yet', async () => {
    mockAssignPermission.mockResolvedValue({})

    const { result } = renderHook(() => useRolePermissions('role-1'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.handleToggle({ id: 'perm-2', code: 'MANAGE_USERS', description: '' })
    })

    expect(mockAssignPermission).toHaveBeenCalledWith('role-1', { permissionId: 'perm-2' })
    expect(mockRemovePermission).not.toHaveBeenCalled()
    expect(result.current.pendingPermissionId).toBeNull()
  })

  it('should not toggle when roleId is null', async () => {
    const { result } = renderHook(() => useRolePermissions(null), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.handleToggle(PERMISSION)
    })

    expect(mockAssignPermission).not.toHaveBeenCalled()
    expect(mockRemovePermission).not.toHaveBeenCalled()
  })
})
