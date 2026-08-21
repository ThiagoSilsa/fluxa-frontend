import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVehicleQrQuery } from './use-vehicle-qr-query'

// Shared libs
import { ApiError } from '#/shared/lib/api-error'

import type { ReactNode } from 'react'

// Mock do service
const mockGetVehicleQr = vi.fn()
vi.mock('../services/vehicle.service', () => ({
  vehiclesService: {
    getVehicleQr: (...args: unknown[]) => mockGetVehicleQr(...args),
  },
}))

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const qr = {
  id: 'qr-1',
  vehicleId: 'v-1',
  code: '550e8400-e29b-41d4-a716-446655440000',
  isActive: true,
  issuedBy: null,
  createdAt: '2026-08-21T00:00:00.000Z',
}

// ---------------------------------------------------------------------------
// useVehicleQrQuery
// ---------------------------------------------------------------------------
describe('useVehicleQrQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devolve o QR ativo em sucesso', async () => {
    mockGetVehicleQr.mockResolvedValue(qr)

    const { result } = renderHook(() => useVehicleQrQuery('v-1'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(qr)
  })

  it('devolve null quando o backend responde 404 (sem QR ativo)', async () => {
    mockGetVehicleQr.mockRejectedValue(
      new ApiError({
        statusCode: 404,
        message: 'QR code não encontrado para este veículo.',
      }),
    )

    const { result } = renderHook(() => useVehicleQrQuery('v-1'), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('não busca quando vehicleId é null (dialog fechado)', async () => {
    const { result } = renderHook(() => useVehicleQrQuery(null), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isPending).toBe(true)
    expect(mockGetVehicleQr).not.toHaveBeenCalled()
  })
})
