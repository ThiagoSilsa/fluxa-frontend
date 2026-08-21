import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUserHandlers } from './use-user-handlers'

// ---------------------------------------------------------------------------
// useUserHandlers
// ---------------------------------------------------------------------------
describe('useUserHandlers', () => {
  const defaultParams = {
    updateSearch: vi.fn(),
    search: { isActive: undefined, type: undefined },
    createUser: { mutateAsync: vi.fn() },
    updateUser: { mutateAsync: vi.fn() },
    deleteUser: { mutateAsync: vi.fn() },
    changePassword: { mutateAsync: vi.fn() },
  }

  const user = {
    id: 'user-1',
    name: 'Maria',
    email: 'maria@somar.local',
    phone: '11999999999',
    document: null,
    photoUrl: null,
    type: 'EMPLOYEE' as const,
    isActive: true,
    role: { userRoleId: 'ur-1', roleId: 'role-1', roleName: 'Porteiro', isAdmin: false },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // -----------------------------------------------------------------------
  // Filtros de status
  // -----------------------------------------------------------------------
  describe('status filter', () => {
    it('should map search.isActive to statusValue', () => {
      const { result, rerender } = renderHook(
        ({ search }: { search: { isActive?: boolean; type?: 'EMPLOYEE' | 'VISITOR' } }) =>
          useUserHandlers({ ...defaultParams, search }),
        { initialProps: { search: {} } },
      )
      expect(result.current.statusValue).toBe('all')

      rerender({ search: { isActive: true } })
      expect(result.current.statusValue).toBe('active')

      rerender({ search: { isActive: false } })
      expect(result.current.statusValue).toBe('inactive')
    })

    it('should update search on status change', () => {
      const updateSearch = vi.fn()
      const { result } = renderHook(() => useUserHandlers({ ...defaultParams, updateSearch }))

      act(() => result.current.handleStatusChange('active'))
      expect(updateSearch).toHaveBeenCalledWith({ isActive: true })

      act(() => result.current.handleStatusChange('inactive'))
      expect(updateSearch).toHaveBeenCalledWith({ isActive: false })

      act(() => result.current.handleStatusChange('all'))
      expect(updateSearch).toHaveBeenCalledWith({ isActive: undefined })
    })
  })

  // -----------------------------------------------------------------------
  // Filtro de tipo
  // -----------------------------------------------------------------------
  describe('type filter', () => {
    it('should map search.type to typeValue', () => {
      const { result, rerender } = renderHook(
        ({ search }: { search: { isActive?: boolean; type?: 'EMPLOYEE' | 'VISITOR' } }) =>
          useUserHandlers({ ...defaultParams, search }),
        { initialProps: { search: {} } },
      )
      expect(result.current.typeValue).toBe('all')

      rerender({ search: { type: 'EMPLOYEE' } })
      expect(result.current.typeValue).toBe('EMPLOYEE')
    })

    it('should update search on type change', () => {
      const updateSearch = vi.fn()
      const { result } = renderHook(() => useUserHandlers({ ...defaultParams, updateSearch }))

      act(() => result.current.handleTypeChange('EMPLOYEE'))
      expect(updateSearch).toHaveBeenCalledWith({ type: 'EMPLOYEE' })

      act(() => result.current.handleTypeChange('VISITOR'))
      expect(updateSearch).toHaveBeenCalledWith({ type: 'VISITOR' })

      act(() => result.current.handleTypeChange('all'))
      expect(updateSearch).toHaveBeenCalledWith({ type: undefined })
    })
  })

  // -----------------------------------------------------------------------
  // Dialogs
  // -----------------------------------------------------------------------
  describe('dialogs', () => {
    it('should open and close the create form', () => {
      const { result } = renderHook(() => useUserHandlers(defaultParams))

      act(() => result.current.handleOpenCreate())
      expect(result.current.formState).toEqual({ mode: 'create' })

      act(() => result.current.handleCloseForm())
      expect(result.current.formState).toBeNull()
    })

    it('should open the edit form with the user', () => {
      const { result } = renderHook(() => useUserHandlers(defaultParams))

      act(() => result.current.handleOpenEdit(user))
      expect(result.current.formState).toEqual({ mode: 'edit', user })
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — create
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in create mode', () => {
    it('should call createUser with the create payload when not link', async () => {
      const createUser = { mutateAsync: vi.fn().mockResolvedValue({ id: 'user-1' }) }
      const { result } = renderHook(() => useUserHandlers({ ...defaultParams, createUser }))

      act(() => result.current.handleOpenCreate())

      const values = {
        name: '  Novo  ',
        email: ' novo@somar.local ',
        password: 'senha123',
        phone: ' 11999999999 ',
        document: '',
        type: 'EMPLOYEE' as const,
        isActive: true,
        roleId: 'role-1',
      }

      await act(async () => {
        await result.current.handleSubmitForm(values, false)
      })

      expect(createUser.mutateAsync).toHaveBeenCalledWith({
        email: 'novo@somar.local',
        type: 'EMPLOYEE',
        name: 'Novo',
        password: 'senha123',
        phone: '11999999999',
        roleId: 'role-1',
      })
      expect(result.current.formState).toBeNull()
    })

    it('should call createUser with the link payload when isLink', async () => {
      const createUser = { mutateAsync: vi.fn().mockResolvedValue({ id: 'user-1' }) }
      const { result } = renderHook(() => useUserHandlers({ ...defaultParams, createUser }))

      act(() => result.current.handleOpenCreate())

      const values = {
        name: 'Maria',
        email: ' maria@somar.local ',
        password: 'senha123',
        phone: '11999999999',
        document: '',
        type: 'EMPLOYEE' as const,
        isActive: true,
        roleId: 'role-1',
      }

      await act(async () => {
        await result.current.handleSubmitForm(values, true)
      })

      expect(createUser.mutateAsync).toHaveBeenCalledWith({
        email: 'maria@somar.local',
        type: 'EMPLOYEE',
        roleId: 'role-1',
      })
    })
  })

  // -----------------------------------------------------------------------
  // handleSubmitForm — edit
  // -----------------------------------------------------------------------
  describe('handleSubmitForm in edit mode', () => {
    it('should call updateUser with the diff payload', async () => {
      const updateUser = { mutateAsync: vi.fn().mockResolvedValue({ id: 'user-1' }) }
      const { result } = renderHook(() => useUserHandlers({ ...defaultParams, updateUser }))

      act(() => result.current.handleOpenEdit(user))

      const values = {
        name: 'Maria Silva',
        email: 'maria@somar.local',
        password: '',
        phone: '11999999999',
        document: '',
        type: 'EMPLOYEE' as const,
        isActive: true,
        roleId: 'role-1',
      }

      await act(async () => {
        await result.current.handleSubmitForm(values, false)
      })

      expect(updateUser.mutateAsync).toHaveBeenCalledWith({
        userId: 'user-1',
        payload: { name: 'Maria Silva' },
      })
      expect(result.current.formState).toBeNull()
    })

    it('should call changePassword when a new password is typed', async () => {
      const updateUser = { mutateAsync: vi.fn().mockResolvedValue({ id: 'user-1' }) }
      const changePassword = { mutateAsync: vi.fn().mockResolvedValue({}) }
      const { result } = renderHook(() =>
        useUserHandlers({ ...defaultParams, updateUser, changePassword }),
      )

      act(() => result.current.handleOpenEdit(user))

      const values = {
        name: 'Maria',
        email: 'maria@somar.local',
        password: '  novaSenha123  ',
        phone: '11999999999',
        document: '',
        type: 'EMPLOYEE' as const,
        isActive: true,
        roleId: 'role-1',
      }

      await act(async () => {
        await result.current.handleSubmitForm(values, false)
      })

      expect(updateUser.mutateAsync).not.toHaveBeenCalled()
      expect(changePassword.mutateAsync).toHaveBeenCalledWith({
        userId: 'user-1',
        newPassword: '  novaSenha123  ',
      })
      expect(result.current.formState).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // handleConfirmDelete
  // -----------------------------------------------------------------------
  describe('handleConfirmDelete', () => {
    it('should call deleteUser and clear the target on success', async () => {
      const deleteUser = { mutateAsync: vi.fn().mockResolvedValue(undefined) }
      const { result } = renderHook(() => useUserHandlers({ ...defaultParams, deleteUser }))

      act(() => result.current.setDeleteTarget({ id: 'user-1', name: 'Maria' }))
      expect(result.current.deleteTarget).toEqual({ id: 'user-1', name: 'Maria' })

      await act(async () => {
        await result.current.handleConfirmDelete()
      })

      expect(deleteUser.mutateAsync).toHaveBeenCalledWith('user-1')
      expect(result.current.deleteTarget).toBeNull()
    })

    it('should not call deleteUser without a target', async () => {
      const deleteUser = { mutateAsync: vi.fn() }
      const { result } = renderHook(() => useUserHandlers({ ...defaultParams, deleteUser }))

      await act(async () => {
        await result.current.handleConfirmDelete()
      })

      expect(deleteUser.mutateAsync).not.toHaveBeenCalled()
    })
  })
})
