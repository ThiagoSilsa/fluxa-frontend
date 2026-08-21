import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVehicleTypesQuery } from './use-vehicle-types-query'

// Types
import type { VehicleTypeListParams } from '../types/vehicle-types.types'

import type { ReactNode } from 'react'

// Mock do service
const mockList = vi.fn()
vi.mock('../services/vehicle-type.service', () => ({
  vehicleTypesService: { list: (...args: unknown[]) => mockList(...args) },
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
// useVehicleTypesQuery
// ---------------------------------------------------------------------------
describe('useVehicleTypesQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return isLoading initially', () => {
    mockList.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useVehicleTypesQuery({}), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should return the paginated envelope on success', async () => {
    const mockResponse = {
      limit: 20,
      offset: 0,
      data: [
        { id: 'type-1', code: 'FROTA', name: 'Frota', isFleet: true, isActive: true },
        { id: 'type-2', code: 'PARTICULAR', name: 'Particular', isFleet: false, isActive: true },
      ],
      count: 2,
    }
    mockList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useVehicleTypesQuery({}), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
    expect(mockList).toHaveBeenCalledWith({})
  })

  it('should pass search, limit and offset to the service', async () => {
    mockList.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

    renderHook(() => useVehicleTypesQuery({ search: 'FRO', limit: 20, offset: 40 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(mockList).toHaveBeenCalled())

    expect(mockList).toHaveBeenCalledWith({ search: 'FRO', limit: 20, offset: 40 })
  })

  it('should refetch when isActive filter changes (different query key)', async () => {
    mockList.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

    const { rerender } = renderHook(
      ({ params }: { params: VehicleTypeListParams }) => useVehicleTypesQuery(params),
      {
        initialProps: { params: { isActive: true } },
        wrapper: createQueryWrapper(),
      },
    )

    await waitFor(() => expect(mockList).toHaveBeenCalledWith({ isActive: true }))

    rerender({ params: { isActive: false } })

    await waitFor(() => expect(mockList).toHaveBeenCalledWith({ isActive: false }))
  })

  it('should refetch when isFleet filter changes (different query key)', async () => {
    mockList.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

    const { rerender } = renderHook(
      ({ params }: { params: VehicleTypeListParams }) => useVehicleTypesQuery(params),
      {
        initialProps: { params: { isFleet: true } },
        wrapper: createQueryWrapper(),
      },
    )

    await waitFor(() => expect(mockList).toHaveBeenCalledWith({ isFleet: true }))

    rerender({ params: { isFleet: false } })

    await waitFor(() => expect(mockList).toHaveBeenCalledWith({ isFleet: false }))
  })
})
