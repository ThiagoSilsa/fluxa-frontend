import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRoleHandlers } from './use-role-handlers'

// ---------------------------------------------------------------------------
// useRoleHandlers
// ---------------------------------------------------------------------------
describe('useRoleHandlers', () => {
  const defaultParams = {
    updateSearch: vi.fn(),
    search: { isActive: undefined },
    createRole: { mutateAsync: vi.fn() },
    updateRole: { mutateAsync: vi.fn() },
    deactivateRole: { mutateAsync: vi.fn() },
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
        useRoleHandlers({ ...defaultParams, search: { isActive: undefined } }),
      )
      expect(all.current.statusValue).toBe('all')

      const { result: active } = renderHook(() =>
        useRoleHandlers({ ...defaultParams, search: { isActive: true } }),
      )
      expect(active.current.statusValue).toBe('active')

      const { result: inactive } = renderHook(() =>
        useRoleHandlers({ ...defaultParams, search: { isActive: false } }),
      )
      expect(inactive.current.statusValue).toBe('inactive')
    })

    it('should update search with isActive on change', () => {
      const updateSearch = vi.fn()
      const { result } = renderHook(() => useRoleHandlers({ ...defaultParams, updateSearch }))

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
      const { result } = renderHook(() => useRoleHandlers(defaultParams))

      act(() => {
        result.current.handleOpenCreate()
      })

      expect(result.current.formState).toEqual({ mode: 'create' })
    })

    it('should close the form', () => {
      const { result } = renderHook(() => useRoleHandlers(defaultParams))

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
    it('should open form in edit mode with the role', () => {
      const role = {
        id: 'role-1',
        name: 'Analista',
        description: 'Cargo para analistas',
        isAdmin: false,
        isActive: true,
      }

      const { result } = renderHook(() => useRoleHandlers(defaultParams))

      act(() => {
        result.current.handleOpenEdit(role)
      })

      expect(result.current.formState).toEqual({ mode: 'edit', role })
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — create mode
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in create mode', () => {
    it('should call createRole.mutateAsync with the mapped payload', async () => {
      const createRole = { mutateAsync: vi.fn().mockResolvedValue({ id: 'role-1' }) }

      const { result } = renderHook(() => useRoleHandlers({ ...defaultParams, createRole }))

      act(() => {
        result.current.handleOpenCreate()
      })

      const values = {
        name: '  Novo Cargo  ',
        description: '  Descrição  ',
        isActive: true,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(createRole.mutateAsync).toHaveBeenCalledWith({
        name: 'Novo Cargo',
        description: 'Descrição',
      })
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — edit mode
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in edit mode', () => {
    it('should call updateRole.mutateAsync with the mapped payload', async () => {
      const updateRole = { mutateAsync: vi.fn().mockResolvedValue({ id: 'role-1' }) }

      const role = {
        id: 'role-1',
        name: 'Analista',
        description: 'Cargo para analistas',
        isAdmin: false,
        isActive: true,
      }

      const { result } = renderHook(() => useRoleHandlers({ ...defaultParams, updateRole }))

      act(() => {
        result.current.handleOpenEdit(role)
      })

      const values = {
        name: '  Atualizado  ',
        description: '  Nova descrição  ',
        isActive: true,
      }

      await act(async () => {
        await result.current.handleSubmitForm(values)
      })

      expect(updateRole.mutateAsync).toHaveBeenCalledWith({
        roleId: 'role-1',
        payload: { name: 'Atualizado', description: 'Nova descrição', isActive: true },
      })
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleOpenPermissions / handleClosePermissions
  // -----------------------------------------------------------------------
  describe('handleOpenPermissions / handleClosePermissions', () => {
    it('should set the permissions role and clear it on close', () => {
      const role = {
        id: 'role-1',
        name: 'Analista',
        description: null,
        isAdmin: false,
        isActive: true,
      }

      const { result } = renderHook(() => useRoleHandlers(defaultParams))

      act(() => {
        result.current.handleOpenPermissions(role)
      })
      expect(result.current.permissionsRole).toEqual(role)

      act(() => {
        result.current.handleClosePermissions()
      })
      expect(result.current.permissionsRole).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleConfirmDelete
  // -----------------------------------------------------------------------
  describe('handleConfirmDelete', () => {
    it('should call deactivateRole.mutateAsync and clear deleteTarget on success', async () => {
      const deactivateRole = { mutateAsync: vi.fn().mockResolvedValue({ id: 'role-1' }) }

      const { result } = renderHook(() => useRoleHandlers({ ...defaultParams, deactivateRole }))

      act(() => {
        result.current.setDeleteTarget({ id: 'role-1', name: 'Admin' })
      })
      expect(result.current.deleteTarget).toEqual({ id: 'role-1', name: 'Admin' })

      await act(async () => {
        await result.current.handleConfirmDelete()
      })

      expect(deactivateRole.mutateAsync).toHaveBeenCalledWith('role-1')
      expect(result.current.deleteTarget).toBeNull()
    })

    it('should not call deactivateRole.mutateAsync when deleteTarget is null', async () => {
      const deactivateRole = { mutateAsync: vi.fn() }

      const { result } = renderHook(() => useRoleHandlers({ ...defaultParams, deactivateRole }))

      await act(async () => {
        await result.current.handleConfirmDelete()
      })

      expect(deactivateRole.mutateAsync).not.toHaveBeenCalled()
    })
  })
})
