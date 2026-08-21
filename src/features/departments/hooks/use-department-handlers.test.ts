import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDepartmentHandlers } from './use-department-handlers'

// ---------------------------------------------------------------------------
// useDepartmentHandlers
// ---------------------------------------------------------------------------
describe('useDepartmentHandlers', () => {
  const defaultParams = {
    updateSearch: vi.fn(),
    search: { isActive: undefined },
    createDepartment: { mutateAsync: vi.fn() },
    updateDepartment: { mutateAsync: vi.fn() },
    deleteDepartment: { mutateAsync: vi.fn() },
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
        useDepartmentHandlers({ ...defaultParams, search: { isActive: undefined } }),
      )
      expect(all.current.statusValue).toBe('all')

      const { result: active } = renderHook(() =>
        useDepartmentHandlers({ ...defaultParams, search: { isActive: true } }),
      )
      expect(active.current.statusValue).toBe('active')

      const { result: inactive } = renderHook(() =>
        useDepartmentHandlers({ ...defaultParams, search: { isActive: false } }),
      )
      expect(inactive.current.statusValue).toBe('inactive')
    })

    it('should update search with isActive on change', () => {
      const updateSearch = vi.fn()
      const { result } = renderHook(() => useDepartmentHandlers({ ...defaultParams, updateSearch }))

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
  // handleOpenCreate / handleCloseForm
  // -----------------------------------------------------------------------
  describe('handleOpenCreate / handleCloseForm', () => {
    it('should open form in create mode', () => {
      const { result } = renderHook(() => useDepartmentHandlers(defaultParams))

      act(() => {
        result.current.handleOpenCreate()
      })

      expect(result.current.formState).toEqual({ mode: 'create' })
    })

    it('should close the form', () => {
      const { result } = renderHook(() => useDepartmentHandlers(defaultParams))

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
    it('should open form in edit mode with the department', () => {
      const department = {
        id: 'dept-1',
        name: 'Recepção',
        description: null,
        parkingSpace: 30,
        isActive: true,
      }

      const { result } = renderHook(() => useDepartmentHandlers(defaultParams))

      act(() => {
        result.current.handleOpenEdit(department)
      })

      expect(result.current.formState).toEqual({ mode: 'edit', department })
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — create mode
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in create mode', () => {
    it('should call createDepartment.mutateAsync with the mapped payload', async () => {
      const createDepartment = { mutateAsync: vi.fn().mockResolvedValue({ id: 'dept-1' }) }

      const { result } = renderHook(() =>
        useDepartmentHandlers({ ...defaultParams, createDepartment }),
      )

      act(() => {
        result.current.handleOpenCreate()
      })

      const values = {
        name: '  Recepção  ',
        parkingSpace: 30,
        description: '  Recepção principal  ',
        isActive: true,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(createDepartment.mutateAsync).toHaveBeenCalledWith({
        name: 'Recepção',
        parkingSpace: 30,
        description: 'Recepção principal',
      })
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — edit mode
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in edit mode', () => {
    it('should call updateDepartment.mutateAsync with the mapped payload (diff)', async () => {
      const updateDepartment = { mutateAsync: vi.fn().mockResolvedValue({ id: 'dept-1' }) }

      const department = {
        id: 'dept-1',
        name: 'Recepção',
        description: 'Recepção principal',
        parkingSpace: 30,
        isActive: true,
      }

      const { result } = renderHook(() =>
        useDepartmentHandlers({ ...defaultParams, updateDepartment }),
      )

      act(() => {
        result.current.handleOpenEdit(department)
      })

      const values = {
        name: '  Recepção 2  ',
        parkingSpace: 45,
        description: 'Recepção principal',
        isActive: false,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(updateDepartment.mutateAsync).toHaveBeenCalledWith({
        departmentId: 'dept-1',
        payload: { name: 'Recepção 2', parkingSpace: 45, isActive: false },
      })
      expect(result.current.formState).toBeNull()
    })

    it('should not call update when nothing changed', async () => {
      const updateDepartment = { mutateAsync: vi.fn().mockResolvedValue({ id: 'dept-1' }) }

      const department = {
        id: 'dept-1',
        name: 'Recepção',
        description: null,
        parkingSpace: 30,
        isActive: true,
      }

      const { result } = renderHook(() =>
        useDepartmentHandlers({ ...defaultParams, updateDepartment }),
      )

      act(() => {
        result.current.handleOpenEdit(department)
      })

      const values = {
        name: 'Recepção',
        parkingSpace: 30,
        description: '',
        isActive: true,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(updateDepartment.mutateAsync).not.toHaveBeenCalled()
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleConfirmDelete
  // -----------------------------------------------------------------------
  describe('handleConfirmDelete', () => {
    it('should call deleteDepartment.mutateAsync and clear the target', async () => {
      const deleteDepartment = { mutateAsync: vi.fn().mockResolvedValue(undefined) }

      const { result } = renderHook(() =>
        useDepartmentHandlers({ ...defaultParams, deleteDepartment }),
      )

      act(() => {
        result.current.setDeleteTarget({ id: 'dept-1', name: 'Recepção' })
      })

      await act(async () => {
        await result.current.handleConfirmDelete()
      })

      expect(deleteDepartment.mutateAsync).toHaveBeenCalledWith('dept-1')
      expect(result.current.deleteTarget).toBeNull()
    })
  })
})
