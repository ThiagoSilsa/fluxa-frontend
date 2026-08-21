import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVehiclesQuery } from './use-vehicles-query'

// Types
import type { VehicleListParams } from '../types/vehicles.types'

import type { ReactNode } from 'react'

// Mock do service
const mockList = vi.fn()
vi.mock('../services/vehicle.service', () => ({
  vehiclesService: { list: (...args: unknown[]) => mockList(...args) },
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
// useVehiclesQuery
// ---------------------------------------------------------------------------
describe('useVehiclesQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return isLoading initially', () => {
    mockList.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useVehiclesQuery({}), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('should return the paginated envelope on success', async () => {
    const mockResponse = {
      limit: 10,
      offset: 0,
      data: [
        {
          id: 'v-1',
          plate: 'ABC1D23',
          model: 'Onix',
          color: null,
          observation: null,
          isBlocked: false,
          freePass: false,
          vehicleTypeId: 'type-1',
          vehicleType: { id: 'type-1', code: 'FROTA', name: 'Frota', isFleet: true },
          isActive: true,
          createdAt: '2026-08-15T00:00:00.000Z',
        },
      ],
      count: 1,
    }
    mockList.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useVehiclesQuery({}), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
    expect(mockList).toHaveBeenCalledWith({})
  })

  it('should pass search, filters, sort and pagination to the service', async () => {
    mockList.mockResolvedValue({ limit: 10, offset: 0, data: [], count: 0 })

    renderHook(
      () =>
        useVehiclesQuery({
          search: 'ABC',
          isActive: true,
          freePass: false,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
          limit: 20,
          offset: 40,
        }),
      { wrapper: createQueryWrapper() },
    )

    await waitFor(() => expect(mockList).toHaveBeenCalled())

    expect(mockList).toHaveBeenCalledWith({
      search: 'ABC',
      isActive: true,
      freePass: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      limit: 20,
      offset: 40,
    })
  })

  it('should refetch when sortBy changes (different query key)', async () => {
    mockList.mockResolvedValue({ limit: 10, offset: 0, data: [], count: 0 })

    const { rerender } = renderHook(
      ({ params }: { params: VehicleListParams }) => useVehiclesQuery(params),
      {
        initialProps: { params: { sortBy: 'plate', sortOrder: 'ASC' } },
        wrapper: createQueryWrapper(),
      },
    )

    await waitFor(() =>
      expect(mockList).toHaveBeenCalledWith({ sortBy: 'plate', sortOrder: 'ASC' }),
    )

    rerender({ params: { sortBy: 'createdAt', sortOrder: 'DESC' } })

    await waitFor(() =>
      expect(mockList).toHaveBeenCalledWith({ sortBy: 'createdAt', sortOrder: 'DESC' }),
    )
  })
})
