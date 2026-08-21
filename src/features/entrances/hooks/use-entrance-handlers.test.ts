import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEntranceHandlers } from './use-entrance-handlers'

// ---------------------------------------------------------------------------
// useEntranceHandlers
// ---------------------------------------------------------------------------
describe('useEntranceHandlers', () => {
  const defaultParams = {
    updateSearch: vi.fn(),
    search: { isActive: undefined },
    createEntrance: { mutateAsync: vi.fn() },
    updateEntrance: { mutateAsync: vi.fn() },
    deleteEntrance: { mutateAsync: vi.fn() },
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
        useEntranceHandlers({ ...defaultParams, search: { isActive: undefined } }),
      )
      expect(all.current.statusValue).toBe('all')

      const { result: active } = renderHook(() =>
        useEntranceHandlers({ ...defaultParams, search: { isActive: true } }),
      )
      expect(active.current.statusValue).toBe('active')

      const { result: inactive } = renderHook(() =>
        useEntranceHandlers({ ...defaultParams, search: { isActive: false } }),
      )
      expect(inactive.current.statusValue).toBe('inactive')
    })

    it('should update search with isActive on change', () => {
      const updateSearch = vi.fn()
      const { result } = renderHook(() => useEntranceHandlers({ ...defaultParams, updateSearch }))

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
      const { result } = renderHook(() => useEntranceHandlers(defaultParams))

      act(() => {
        result.current.handleOpenCreate()
      })

      expect(result.current.formState).toEqual({ mode: 'create' })
    })

    it('should close the form', () => {
      const { result } = renderHook(() => useEntranceHandlers(defaultParams))

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
    it('should open form in edit mode with the entrance', () => {
      const entrance = {
        id: 'ent-1',
        name: 'Portaria Principal',
        isActive: true,
      }

      const { result } = renderHook(() => useEntranceHandlers(defaultParams))

      act(() => {
        result.current.handleOpenEdit(entrance)
      })

      expect(result.current.formState).toEqual({ mode: 'edit', entrance })
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — create mode
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in create mode', () => {
    it('should call createEntrance.mutateAsync with the mapped payload', async () => {
      const createEntrance = { mutateAsync: vi.fn().mockResolvedValue({ id: 'ent-1' }) }

      const { result } = renderHook(() => useEntranceHandlers({ ...defaultParams, createEntrance }))

      act(() => {
        result.current.handleOpenCreate()
      })

      const values = {
        name: '  Portaria Principal  ',
        isActive: true,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(createEntrance.mutateAsync).toHaveBeenCalledWith({
        name: 'Portaria Principal',
      })
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — edit mode
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in edit mode', () => {
    it('should call updateEntrance.mutateAsync with the mapped payload (diff)', async () => {
      const updateEntrance = { mutateAsync: vi.fn().mockResolvedValue({ id: 'ent-1' }) }

      const entrance = {
        id: 'ent-1',
        name: 'Portaria Principal',
        isActive: true,
      }

      const { result } = renderHook(() => useEntranceHandlers({ ...defaultParams, updateEntrance }))

      act(() => {
        result.current.handleOpenEdit(entrance)
      })

      const values = {
        name: '  Portaria Central  ',
        isActive: false,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(updateEntrance.mutateAsync).toHaveBeenCalledWith({
        entranceId: 'ent-1',
        payload: { name: 'Portaria Central', isActive: false },
      })
      expect(result.current.formState).toBeNull()
    })

    it('should not call update when nothing changed', async () => {
      const updateEntrance = { mutateAsync: vi.fn().mockResolvedValue({ id: 'ent-1' }) }

      const entrance = {
        id: 'ent-1',
        name: 'Portaria Principal',
        isActive: true,
      }

      const { result } = renderHook(() => useEntranceHandlers({ ...defaultParams, updateEntrance }))

      act(() => {
        result.current.handleOpenEdit(entrance)
      })

      const values = {
        name: 'Portaria Principal',
        isActive: true,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(updateEntrance.mutateAsync).not.toHaveBeenCalled()
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleConfirmDelete
  // -----------------------------------------------------------------------
  describe('handleConfirmDelete', () => {
    it('should call deleteEntrance.mutateAsync and clear the target', async () => {
      const deleteEntrance = { mutateAsync: vi.fn().mockResolvedValue(undefined) }

      const { result } = renderHook(() => useEntranceHandlers({ ...defaultParams, deleteEntrance }))

      act(() => {
        result.current.setDeleteTarget({ id: 'ent-1', name: 'Portaria Principal' })
      })

      await act(async () => {
        await result.current.handleConfirmDelete()
      })

      expect(deleteEntrance.mutateAsync).toHaveBeenCalledWith('ent-1')
      expect(result.current.deleteTarget).toBeNull()
    })
  })
})
