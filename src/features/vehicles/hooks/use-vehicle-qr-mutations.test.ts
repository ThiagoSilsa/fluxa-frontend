import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVehicleQrMutations } from './use-vehicle-qr-mutations'

import type { ReactNode } from 'react'

// Mocks de i18n e toast
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
        return mockT(key)
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
const mockEmit = vi.fn()
const mockReissue = vi.fn()
const mockRevoke = vi.fn()
vi.mock('../services/vehicle.service', () => ({
  vehiclesService: {
    emitVehicleQr: (...args: unknown[]) => mockEmit(...args),
    reissueVehicleQr: (...args: unknown[]) => mockReissue(...args),
    revokeVehicleQr: (...args: unknown[]) => mockRevoke(...args),
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
// useVehicleQrMutations
// ---------------------------------------------------------------------------
describe('useVehicleQrMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('emit chama o service e exibe toast de sucesso', async () => {
    mockEmit.mockResolvedValue(qr)

    const { result } = renderHook(() => useVehicleQrMutations('v-1'), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.emit.mutateAsync()
    })

    expect(mockEmit).toHaveBeenCalled()
    expect(mockToastSuccess).toHaveBeenCalledWith('qr.notifications.emit-success')
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled())
  })

  it('reissue chama o service com sucesso', async () => {
    mockReissue.mockResolvedValue({ ...qr, code: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' })

    const { result } = renderHook(() => useVehicleQrMutations('v-1'), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.reissue.mutateAsync()
    })

    expect(mockReissue).toHaveBeenCalled()
    expect(mockToastSuccess).toHaveBeenCalledWith('qr.notifications.reissue-success')
  })

  it('revoke chama o service com sucesso', async () => {
    mockRevoke.mockResolvedValue(undefined)

    const { result } = renderHook(() => useVehicleQrMutations('v-1'), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.revoke.mutateAsync()
    })

    expect(mockRevoke).toHaveBeenCalled()
    expect(mockToastSuccess).toHaveBeenCalledWith('qr.notifications.revoke-success')
  })

  it('erro exibe toast via mapa de códigos', async () => {
    mockEmit.mockRejectedValue(new Error('falha'))

    const { result } = renderHook(() => useVehicleQrMutations('v-1'), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      try {
        await result.current.emit.mutateAsync()
      } catch {
        // esperado
      }
    })

    expect(mockToastError).toHaveBeenCalled()
  })
})
