import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVehicleMutations } from './use-vehicle-mutations'

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
const service = {
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  setDepartment: vi.fn(),
  removeDepartment: vi.fn(),
  addDriver: vi.fn(),
  updateDriver: vi.fn(),
  removeDriver: vi.fn(),
}
vi.mock('../services/vehicle.service', () => ({
  vehiclesService: {
    create: (...args: unknown[]) => service.create(...args),
    update: (...args: unknown[]) => service.update(...args),
    remove: (...args: unknown[]) => service.remove(...args),
    setDepartment: (...args: unknown[]) => service.setDepartment(...args),
    removeDepartment: (...args: unknown[]) => service.removeDepartment(...args),
    addDriver: (...args: unknown[]) => service.addDriver(...args),
    updateDriver: (...args: unknown[]) => service.updateDriver(...args),
    removeDriver: (...args: unknown[]) => service.removeDriver(...args),
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

// ---------------------------------------------------------------------------
// useVehicleMutations
// ---------------------------------------------------------------------------
describe('useVehicleMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a vehicle and show success toast', async () => {
    service.create.mockResolvedValue({ id: 'v-1' })

    const { result } = renderHook(() => useVehicleMutations(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.createVehicle.mutateAsync({ plate: 'ABC1D23', vehicleTypeId: 't-1' })
    })

    expect(service.create).toHaveBeenCalledWith({ plate: 'ABC1D23', vehicleTypeId: 't-1' })
    expect(mockToastSuccess).toHaveBeenCalledWith('vehicles:notifications.create-success')
  })

  it('should update a vehicle and show success toast', async () => {
    service.update.mockResolvedValue({ id: 'v-1' })

    const { result } = renderHook(() => useVehicleMutations(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.updateVehicle.mutateAsync({
        vehicleId: 'v-1',
        payload: { model: 'Onix' },
      })
    })

    expect(service.update).toHaveBeenCalledWith('v-1', { model: 'Onix' })
    expect(mockToastSuccess).toHaveBeenCalledWith('vehicles:notifications.update-success')
  })

  it('should delete a vehicle (DELETE 204 void) and show success toast', async () => {
    service.remove.mockResolvedValue(undefined)

    const { result } = renderHook(() => useVehicleMutations(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.deleteVehicle.mutateAsync('v-1')
    })

    expect(service.remove).toHaveBeenCalledWith('v-1')
    expect(mockToastSuccess).toHaveBeenCalledWith('vehicles:notifications.delete-success')
  })

  it('should set and remove the vehicle department', async () => {
    service.setDepartment.mockResolvedValue({ id: 'vd-1' })
    service.removeDepartment.mockResolvedValue(undefined)

    const { result } = renderHook(() => useVehicleMutations(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.setVehicleDepartment.mutateAsync({
        vehicleId: 'v-1',
        departmentId: 'd-1',
      })
    })
    expect(service.setDepartment).toHaveBeenCalledWith('v-1', 'd-1')

    await act(async () => {
      await result.current.removeVehicleDepartment.mutateAsync('v-1')
    })
    expect(service.removeDepartment).toHaveBeenCalledWith('v-1')
  })

  it('should add, update and remove a driver', async () => {
    service.addDriver.mockResolvedValue({ id: 'uv-1' })
    service.updateDriver.mockResolvedValue({ id: 'uv-1' })
    service.removeDriver.mockResolvedValue(undefined)

    const { result } = renderHook(() => useVehicleMutations(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.addDriver.mutateAsync({ vehicleId: 'v-1', payload: { userId: 'u-1' } })
    })
    expect(service.addDriver).toHaveBeenCalledWith('v-1', { userId: 'u-1' })

    await act(async () => {
      await result.current.updateDriver.mutateAsync({
        vehicleId: 'v-1',
        userId: 'u-1',
        payload: { canDrive: false },
      })
    })
    expect(service.updateDriver).toHaveBeenCalledWith('v-1', 'u-1', { canDrive: false })

    await act(async () => {
      await result.current.removeDriver.mutateAsync({ vehicleId: 'v-1', userId: 'u-1' })
    })
    expect(service.removeDriver).toHaveBeenCalledWith('v-1', 'u-1')
  })
})
