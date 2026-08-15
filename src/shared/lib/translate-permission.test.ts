import { describe, expect, it, vi, beforeEach } from 'vitest'
import { translatePermission, translatePermissionLabel } from './translate-permission'

// Mock do i18n (sem inicializar i18next de verdade)
const mockExists = vi.fn()
const mockT = vi.fn()

vi.mock('i18next', () => ({
  default: {
    exists: (...args: unknown[]) => mockExists(...args),
    t: (...args: unknown[]) => mockT(...args),
  },
}))

describe('translatePermission', () => {
  it('should build the roles namespace key from the code', () => {
    expect(translatePermission('MANAGE_ROLES')).toBe('roles:permissions.MANAGE_ROLES')
  })

  it('should handle codes with underscores', () => {
    expect(translatePermission('CREATE_ACCESS_REQUEST')).toBe(
      'roles:permissions.CREATE_ACCESS_REQUEST',
    )
  })
})

describe('translatePermissionLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return the translated label when the key exists', () => {
    mockExists.mockReturnValue(true)
    mockT.mockReturnValue('Gerenciar cargos e permissões')

    const result = translatePermissionLabel('MANAGE_ROLES')

    expect(mockExists).toHaveBeenCalledWith('roles:permissions.MANAGE_ROLES')
    expect(mockT).toHaveBeenCalledWith('roles:permissions.MANAGE_ROLES')
    expect(result).toBe('Gerenciar cargos e permissões')
  })

  it('should return the code as fallback when the key does not exist', () => {
    mockExists.mockReturnValue(false)

    const result = translatePermissionLabel('NEW_PERMISSION')

    expect(mockT).not.toHaveBeenCalled()
    expect(result).toBe('NEW_PERMISSION')
  })
})
