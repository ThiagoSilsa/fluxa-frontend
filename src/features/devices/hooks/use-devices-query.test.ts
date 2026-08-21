import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDevicesQuery } from './use-devices-query'

// Types
import type { DeviceListParams } from '../types/devices.types'

import type { ReactNode } from 'react'

// Mock do service
const mockList = vi.fn()
vi.mock('../services/device.service', () => ({
  devicesService: { list: (...args: unknown[]) => mockList(...args) },
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
// useDevicesQuery
// ---------------------------------------------------------------------------
describe('useDevicesQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devolve o envelope paginado em sucesso', async () => {
    const mockResponse = {
      limit: 10,
      offset: 0,
      data: [
        {
          id: 'device-1',
          name: 'Tablet Portaria 1',
          platform: 'ANDROID',
          appVersion: null,
          entranceId: null,
          entrance: null,
          lastSyncAt: null,
          isActive: true,
          createdAt: '2026-08-21T00:00:00.000Z',
          updatedAt: '2026-08-21T00:00:00.000Z',
        },
      ],
      count: 1,
    }
    mockList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useDevicesQuery({ limit: 10, offset: 0 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockList).toHaveBeenCalledWith({ limit: 10, offset: 0 })
    expect(result.current.data?.count).toBe(1)
  })

  it('re-busca quando os parâmetros mudam (query key)', async () => {
    mockList.mockResolvedValue({ limit: 10, offset: 0, data: [], count: 0 })

    const params: DeviceListParams = { search: 'Tablet', isActive: true }
    const { result, rerender } = renderHook(({ listParams }) => useDevicesQuery(listParams), {
      wrapper: createQueryWrapper(),
      initialProps: { listParams: params },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    rerender({ listParams: { ...params, search: 'Portaria' } })

    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2))
    expect(mockList).toHaveBeenLastCalledWith({ search: 'Portaria', isActive: true })
  })
})
