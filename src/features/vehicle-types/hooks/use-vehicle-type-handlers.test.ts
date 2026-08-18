import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVehicleTypeHandlers } from './use-vehicle-type-handlers'

// ---------------------------------------------------------------------------
// useVehicleTypeHandlers
// ---------------------------------------------------------------------------
describe('useVehicleTypeHandlers', () => {
  const defaultParams = {
    updateSearch: vi.fn(),
    search: { isActive: undefined, isFleet: undefined },
    createVehicleType: { mutateAsync: vi.fn() },
    updateVehicleType: { mutateAsync: vi.fn() },
    deleteVehicleType: { mutateAsync: vi.fn() },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // -----------------------------------------------------------------------
  // Filtro de status
  // -----------------------------------------------------------------------
  describe('status filter', () => {
    it('should map search.isActive to statusValue', () => {
      const { result: all } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, search: { isActive: undefined } }),
      )
      expect(all.current.statusValue).toBe('all')

      const { result: active } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, search: { isActive: true } }),
      )
      expect(active.current.statusValue).toBe('active')

      const { result: inactive } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, search: { isActive: false } }),
      )
      expect(inactive.current.statusValue).toBe('inactive')
    })

    it('should update search with isActive on change', () => {
      const updateSearch = vi.fn()
      const { result } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, updateSearch }),
      )

      act(() => {
        result.current.handleStatusChange('active')
      })
      expect(updateSearch).toHaveBeenCalledWith({ isActive: true })

      act(() => {
        result.current.handleStatusChange('inactive')
      })
      expect(updateSearch).toHaveBeenCalledWith({ isActive: false })

      act(() => {
        result.current.handleStatusChange('all')
      })
      expect(updateSearch).toHaveBeenCalledWith({ isActive: undefined })
    })
  })

  // -----------------------------------------------------------------------
  // Filtro de frota
  // -----------------------------------------------------------------------
  describe('isFleet filter', () => {
    it('should map search.isFleet to isFleetValue', () => {
      const { result: all } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, search: { isFleet: undefined } }),
      )
      expect(all.current.isFleetValue).toBe('all')

      const { result: fleet } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, search: { isFleet: true } }),
      )
      expect(fleet.current.isFleetValue).toBe('fleet')

      const { result: nonFleet } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, search: { isFleet: false } }),
      )
      expect(nonFleet.current.isFleetValue).toBe('non-fleet')
    })

    it('should update search with isFleet on change', () => {
      const updateSearch = vi.fn()
      const { result } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, updateSearch }),
      )

      act(() => {
        result.current.handleIsFleetChange('fleet')
      })
      expect(updateSearch).toHaveBeenCalledWith({ isFleet: true })

      act(() => {
        result.current.handleIsFleetChange('non-fleet')
      })
      expect(updateSearch).toHaveBeenCalledWith({ isFleet: false })

      act(() => {
        result.current.handleIsFleetChange('all')
      })
      expect(updateSearch).toHaveBeenCalledWith({ isFleet: undefined })
    })
  })

  // -----------------------------------------------------------------------
  // handleOpenCreate / handleCloseForm
  // -----------------------------------------------------------------------
  describe('handleOpenCreate / handleCloseForm', () => {
    it('should open form in create mode', () => {
      const { result } = renderHook(() => useVehicleTypeHandlers(defaultParams))

      act(() => {
        result.current.handleOpenCreate()
      })

      expect(result.current.formState).toEqual({ mode: 'create' })
    })

    it('should close the form', () => {
      const { result } = renderHook(() => useVehicleTypeHandlers(defaultParams))

      act(() => {
        result.current.handleOpenCreate()
      })
      expect(result.current.formState).not.toBeNull()

      act(() => {
        result.current.handleCloseForm()
      })
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleOpenEdit
  // -----------------------------------------------------------------------
  describe('handleOpenEdit', () => {
    it('should open form in edit mode with the vehicle type', () => {
      const vehicleType = {
        id: 'type-1',
        code: 'FROTA',
        name: 'Frota',
        description: null,
        isFleet: true,
        isActive: true,
      }

      const { result } = renderHook(() => useVehicleTypeHandlers(defaultParams))

      act(() => {
        result.current.handleOpenEdit(vehicleType)
      })

      expect(result.current.formState).toEqual({ mode: 'edit', vehicleType })
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — create mode
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in create mode', () => {
    it('should call createVehicleType.mutateAsync with the mapped payload', async () => {
      const createVehicleType = { mutateAsync: vi.fn().mockResolvedValue({ id: 'type-1' }) }

      const { result } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, createVehicleType }),
      )

      act(() => {
        result.current.handleOpenCreate()
      })

      const values = {
        code: '  utilitario ',
        name: '  Utilitário  ',
        description: '  Veículos utilitários  ',
        isFleet: true,
        isActive: true,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(createVehicleType.mutateAsync).toHaveBeenCalledWith({
        code: 'UTILITARIO',
        name: 'Utilitário',
        description: 'Veículos utilitários',
        isFleet: true,
      })
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — edit mode
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in edit mode', () => {
    it('should call updateVehicleType.mutateAsync with the mapped payload (diff)', async () => {
      const updateVehicleType = { mutateAsync: vi.fn().mockResolvedValue({ id: 'type-1' }) }

      const vehicleType = {
        id: 'type-1',
        code: 'FROTA',
        name: 'Frota',
        description: 'Veículos de frota',
        isFleet: true,
        isActive: true,
      }

      const { result } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, updateVehicleType }),
      )

      act(() => {
        result.current.handleOpenEdit(vehicleType)
      })

      const values = {
        code: 'FROTA',
        name: '  Frota 2  ',
        description: 'Veículos de frota',
        isFleet: true,
        isActive: false,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(updateVehicleType.mutateAsync).toHaveBeenCalledWith({
        vehicleTypeId: 'type-1',
        payload: { name: 'Frota 2', isActive: false },
      })
      expect(result.current.formState).toBeNull()
    })

    it('should not call update when nothing changed', async () => {
      const updateVehicleType = { mutateAsync: vi.fn().mockResolvedValue({ id: 'type-1' }) }

      const vehicleType = {
        id: 'type-1',
        code: 'FROTA',
        name: 'Frota',
        description: null,
        isFleet: true,
        isActive: true,
      }

      const { result } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, updateVehicleType }),
      )

      act(() => {
        result.current.handleOpenEdit(vehicleType)
      })

      const values = {
        code: 'frota',
        name: 'Frota',
        description: '',
        isFleet: true,
        isActive: true,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(updateVehicleType.mutateAsync).not.toHaveBeenCalled()
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleConfirmDelete
  // -----------------------------------------------------------------------
  describe('handleConfirmDelete', () => {
    it('should call deleteVehicleType.mutateAsync and clear the target', async () => {
      const deleteVehicleType = { mutateAsync: vi.fn().mockResolvedValue(undefined) }

      const { result } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, deleteVehicleType }),
      )

      act(() => {
        result.current.setDeleteTarget({ id: 'type-1', name: 'Frota' })
      })

      await act(async () => {
        await result.current.handleConfirmDelete()
      })

      expect(deleteVehicleType.mutateAsync).toHaveBeenCalledWith('type-1')
      expect(result.current.deleteTarget).toBeNull()
    })

    it('should do nothing when there is no delete target', async () => {
      const deleteVehicleType = { mutateAsync: vi.fn() }

      const { result } = renderHook(() =>
        useVehicleTypeHandlers({ ...defaultParams, deleteVehicleType }),
      )

      await act(async () => {
        await result.current.handleConfirmDelete()
      })

      expect(deleteVehicleType.mutateAsync).not.toHaveBeenCalled()
    })
  })
})
