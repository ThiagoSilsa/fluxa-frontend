import { beforeEach, describe, expect, it, vi } from 'vitest'
import { permissionsService, rolesService } from './role.service'

// Controller
import baseController from '#/shared/controller/base.controller'

// Mock do baseController
vi.mock('#/shared/controller/base.controller', () => ({
  default: {
    makeRequest: vi.fn(),
  },
}))

const mockedMakeRequest = vi.mocked(baseController.makeRequest)

// ---------------------------------------------------------------------------
// RolesService
// ---------------------------------------------------------------------------
describe('RolesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should call makeRequest with GET on /roles', async () => {
      const mockResponse = { limit: 20, offset: 0, data: [], count: 0 }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await rolesService.list({})

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: expect.stringContaining('/roles?'),
        method: 'GET',
      })
      expect(result).toEqual(mockResponse)
    })

    it('should include search, limit and offset in the query', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await rolesService.list({ search: 'Analista', limit: 20, offset: 40 })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('search=Analista')
      expect(callArgs.endpoint).toContain('limit=20')
      expect(callArgs.endpoint).toContain('offset=40')
    })

    it('should include isActive in the query when provided', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await rolesService.list({ isActive: false })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('isActive=false')
    })
  })

  describe('create', () => {
    it('should call makeRequest with POST and body', async () => {
      const payload = { name: 'Novo Cargo', description: 'Descrição' }
      mockedMakeRequest.mockResolvedValue({ id: 'role-1', ...payload })

      const result = await rolesService.create(payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/roles',
        method: 'POST',
        body: payload,
      })
      expect(result).toHaveProperty('id', 'role-1')
    })
  })

  describe('update', () => {
    it('should call makeRequest with PATCH and body', async () => {
      const payload = { name: 'Atualizado' }
      mockedMakeRequest.mockResolvedValue({ id: 'role-1', ...payload })

      const result = await rolesService.update('role-1', payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/roles/role-1',
        method: 'PATCH',
        body: payload,
      })
      expect(result).toHaveProperty('name', 'Atualizado')
    })
  })

  describe('remove', () => {
    it('should call makeRequest with DELETE', async () => {
      mockedMakeRequest.mockResolvedValue('')

      await rolesService.remove('role-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/roles/role-1',
        method: 'DELETE',
      })
    })
  })

  describe('listRolePermissions', () => {
    it('should call makeRequest with GET on /roles/:id/permissions', async () => {
      const mockResponse = { roleId: 'role-1', permissions: [], available: [] }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await rolesService.listRolePermissions('role-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/roles/role-1/permissions',
        method: 'GET',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('assignPermission', () => {
    it('should call makeRequest with POST and permissionId', async () => {
      const payload = { permissionId: 'perm-1' }
      mockedMakeRequest.mockResolvedValue({})

      await rolesService.assignPermission('role-1', payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/roles/role-1/permissions',
        method: 'POST',
        body: payload,
      })
    })
  })

  describe('removePermission', () => {
    it('should call makeRequest with DELETE on the permission path', async () => {
      mockedMakeRequest.mockResolvedValue({})

      await rolesService.removePermission('role-1', 'perm-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/roles/role-1/permissions/perm-1',
        method: 'DELETE',
      })
    })
  })
})

// ---------------------------------------------------------------------------
// PermissionsService
// ---------------------------------------------------------------------------
describe('PermissionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should call makeRequest with GET on /permissions', async () => {
      const mockResponse: unknown[] = []
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await permissionsService.list()

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/permissions',
        method: 'GET',
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
