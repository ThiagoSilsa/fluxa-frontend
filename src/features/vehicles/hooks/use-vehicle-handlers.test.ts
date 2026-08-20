import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVehicleHandlers } from './use-vehicle-handlers'

// ---------------------------------------------------------------------------
// useVehicleHandlers
// ---------------------------------------------------------------------------
describe('useVehicleHandlers', () => {
  const defaultParams = {
    updateSearch: vi.fn(),
    search: {
      isActive: undefined,
      freePass: undefined,
      vehicleTypeId: undefined,
      departmentId: undefined,
    },
    createVehicle: { mutateAsync: vi.fn() },
    updateVehicle: { mutateAsync: vi.fn() },
    deleteVehicle: { mutateAsync: vi.fn() },
    setVehicleDepartment: { mutateAsync: vi.fn() },
    removeVehicleDepartment: { mutateAsync: vi.fn() },
  }

  const vehicle = {
    id: 'v-1',
    plate: 'ABC1D23',
    model: 'Onix',
    color: 'Prata',
    observation: null,
    isBlocked: false,
    freePass: false,
    vehicleTypeId: 'type-1',
    vehicleType: { id: 'type-1', code: 'FROTA', name: 'Frota', isFleet: true },
    isActive: true,
    createdAt: '2026-08-15T00:00:00.000Z',
  }

  const formValues = {
    plate: 'ABC1D23',
    vehicleTypeId: 'type-1',
    model: 'Onix',
    color: 'Prata',
    observation: 'Obs',
    departmentId: '',
    freePass: false,
    isActive: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // -----------------------------------------------------------------------
  // Filtros
  // -----------------------------------------------------------------------
  describe('filters', () => {
    it('should map search.isActive to statusValue and update on change', () => {
      const { result } = renderHook(() => useVehicleHandlers(defaultParams))

      expect(result.current.statusValue).toBe('all')

      act(() => result.current.handleStatusChange('active'))
      expect(defaultParams.updateSearch).toHaveBeenCalledWith({ isActive: true })

      act(() => result.current.handleStatusChange('all'))
      expect(defaultParams.updateSearch).toHaveBeenCalledWith({ isActive: undefined })
    })

    it('should map search.freePass to freePassValue and update on change', () => {
      const { result } = renderHook(() => useVehicleHandlers(defaultParams))

      expect(result.current.freePassValue).toBe('all')

      act(() => result.current.handleFreePassChange('free'))
      expect(defaultParams.updateSearch).toHaveBeenCalledWith({ freePass: true })

      act(() => result.current.handleFreePassChange('no-free'))
      expect(defaultParams.updateSearch).toHaveBeenCalledWith({ freePass: false })

      act(() => result.current.handleFreePassChange('all'))
      expect(defaultParams.updateSearch).toHaveBeenCalledWith({ freePass: undefined })
    })
  })

  // -----------------------------------------------------------------------
  // Dialogs de formulário
  // -----------------------------------------------------------------------
  describe('form dialogs', () => {
    it('should open create, edit and close', () => {
      const { result } = renderHook(() => useVehicleHandlers(defaultParams))

      act(() => result.current.handleOpenCreate())
      expect(result.current.formState).toEqual({ mode: 'create' })

      act(() => result.current.handleOpenEdit(vehicle))
      expect(result.current.formState).toEqual({ mode: 'edit', vehicle, departmentId: undefined })

      act(() => result.current.handleCloseForm())
      expect(result.current.formState).toBeNull()
    })

    it('should track current department change in edit mode', () => {
      const { result } = renderHook(() => useVehicleHandlers(defaultParams))

      act(() => result.current.handleOpenEdit(vehicle))
      act(() => result.current.handleCurrentDepartmentChange('dept-1'))

      expect(result.current.formState).toEqual({ mode: 'edit', vehicle, departmentId: 'dept-1' })
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — create
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in create mode', () => {
    it('should create and link department when selected', async () => {
      const createVehicle = { mutateAsync: vi.fn().mockResolvedValue(vehicle) }
      const setVehicleDepartment = { mutateAsync: vi.fn().mockResolvedValue({ id: 'vd-1' }) }

      const { result } = renderHook(() =>
        useVehicleHandlers({
          ...defaultParams,
          createVehicle,
          setVehicleDepartment,
        }),
      )

      act(() => result.current.handleOpenCreate())

      await act(async () => {
        await result.current.handleSubmitForm({ ...formValues, departmentId: 'dept-1' })
      })

      expect(createVehicle.mutateAsync).toHaveBeenCalledWith({
        plate: 'ABC1D23',
        vehicleTypeId: 'type-1',
        model: 'Onix',
        color: 'Prata',
        observation: 'Obs',
        freePass: false,
      })
      expect(setVehicleDepartment.mutateAsync).toHaveBeenCalledWith({
        vehicleId: 'v-1',
        departmentId: 'dept-1',
      })
      expect(result.current.formState).toBeNull()
    })

    it('should create without department when none selected', async () => {
      const createVehicle = { mutateAsync: vi.fn().mockResolvedValue(vehicle) }
      const setVehicleDepartment = { mutateAsync: vi.fn() }

      const { result } = renderHook(() =>
        useVehicleHandlers({
          ...defaultParams,
          createVehicle,
          setVehicleDepartment,
        }),
      )

      act(() => result.current.handleOpenCreate())

      await act(async () => {
        await result.current.handleSubmitForm(formValues)
      })

      expect(setVehicleDepartment.mutateAsync).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — edit
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in edit mode', () => {
    it('should update fields and sync department when changed', async () => {
      const updateVehicle = { mutateAsync: vi.fn().mockResolvedValue(vehicle) }
      const setVehicleDepartment = { mutateAsync: vi.fn().mockResolvedValue({ id: 'vd-1' }) }

      const { result } = renderHook(() =>
        useVehicleHandlers({
          ...defaultParams,
          updateVehicle,
          setVehicleDepartment,
        }),
      )

      act(() => result.current.handleOpenEdit(vehicle))
      act(() => result.current.handleCurrentDepartmentChange('dept-1'))

      await act(async () => {
        await result.current.handleSubmitForm({
          ...formValues,
          model: 'Onix 2',
          observation: '',
          departmentId: 'dept-2',
        })
      })

      expect(updateVehicle.mutateAsync).toHaveBeenCalledWith({
        vehicleId: 'v-1',
        payload: { model: 'Onix 2' },
      })
      expect(setVehicleDepartment.mutateAsync).toHaveBeenCalledWith({
        vehicleId: 'v-1',
        departmentId: 'dept-2',
      })
      expect(result.current.formState).toBeNull()
    })

    it('should remove department when cleared', async () => {
      const updateVehicle = { mutateAsync: vi.fn().mockResolvedValue(vehicle) }
      const removeVehicleDepartment = { mutateAsync: vi.fn().mockResolvedValue(undefined) }

      const { result } = renderHook(() =>
        useVehicleHandlers({
          ...defaultParams,
          updateVehicle,
          removeVehicleDepartment,
        }),
      )

      act(() => result.current.handleOpenEdit(vehicle))
      act(() => result.current.handleCurrentDepartmentChange('dept-1'))

      await act(async () => {
        await result.current.handleSubmitForm({ ...formValues, departmentId: '' })
      })

      expect(removeVehicleDepartment.mutateAsync).toHaveBeenCalledWith('v-1')
    })

    it('should not call update when nothing changed', async () => {
      const updateVehicle = { mutateAsync: vi.fn() }

      const { result } = renderHook(() => useVehicleHandlers({ ...defaultParams, updateVehicle }))

      act(() => result.current.handleOpenEdit(vehicle))

      await act(async () => {
        await result.current.handleSubmitForm({
          ...formValues,
          plate: 'abc-1d23',
          model: 'Onix',
          color: 'Prata',
          observation: '',
        })
      })

      expect(updateVehicle.mutateAsync).not.toHaveBeenCalled()
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleOpenDetail / handleCloseDetail
  // -----------------------------------------------------------------------
  describe('detail dialog', () => {
    it('should open and close the detail', () => {
      const { result } = renderHook(() => useVehicleHandlers(defaultParams))

      act(() => result.current.handleOpenDetail(vehicle))
      expect(result.current.detailTarget).toEqual(vehicle)

      act(() => result.current.handleCloseDetail())
      expect(result.current.detailTarget).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleConfirmDelete
  // -----------------------------------------------------------------------
  describe('handleConfirmDelete', () => {
    it('should call deleteVehicle.mutateAsync and clear the target', async () => {
      const deleteVehicle = { mutateAsync: vi.fn().mockResolvedValue(undefined) }

      const { result } = renderHook(() => useVehicleHandlers({ ...defaultParams, deleteVehicle }))

      act(() => {
        result.current.setDeleteTarget({ id: 'v-1', name: 'ABC1D23' })
      })

      await act(async () => {
        await result.current.handleConfirmDelete()
      })

      expect(deleteVehicle.mutateAsync).toHaveBeenCalledWith('v-1')
      expect(result.current.deleteTarget).toBeNull()
    })
  })
})
