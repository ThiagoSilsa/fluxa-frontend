import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usersService } from './user.service'

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
// UsersService
// ---------------------------------------------------------------------------
describe('UsersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should call makeRequest with GET on /users and the built query', async () => {
      const mockResponse = { limit: 20, offset: 0, data: [], count: 0 }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await usersService.list({
        search: 'mar',
        type: 'EMPLOYEE',
        isActive: true,
        limit: 20,
        offset: 0,
      })

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: expect.stringContaining('/users?'),
        method: 'GET',
      })
      const endpoint = mockedMakeRequest.mock.calls[0][0].endpoint
      expect(endpoint).toContain('search=mar')
      expect(endpoint).toContain('type=EMPLOYEE')
      expect(endpoint).toContain('isActive=true')
      expect(endpoint).toContain('limit=20')
      expect(endpoint).toContain('offset=0')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('emailStatus', () => {
    it('should call makeRequest with the encoded email', async () => {
      mockedMakeRequest.mockResolvedValue({ exists: true })

      const result = await usersService.emailStatus('maria@somar.local')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/users/email-status?email=maria%40somar.local',
        method: 'GET',
      })
      expect(result).toEqual({ exists: true })
    })
  })

  describe('create', () => {
    it('should call makeRequest with POST and the payload', async () => {
      const payload = {
        email: 'novo@somar.local',
        type: 'EMPLOYEE' as const,
        name: 'Novo',
        password: 'senha123',
        roleId: 'role-1',
      }
      mockedMakeRequest.mockResolvedValue({
        id: 'user-1',
        ...payload,
        createdUser: true,
      })

      const result = await usersService.create(payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/users',
        method: 'POST',
        body: payload,
      })
      expect(result).toHaveProperty('createdUser', true)
    })
  })

  describe('update', () => {
    it('should call makeRequest with PATCH and the diff payload', async () => {
      const payload = { name: 'Atualizado', roleId: 'role-2' }
      mockedMakeRequest.mockResolvedValue({ id: 'user-1', ...payload })

      const result = await usersService.update('user-1', payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/users/user-1',
        method: 'PATCH',
        body: payload,
      })
      expect(result).toHaveProperty('name', 'Atualizado')
    })
  })

  describe('deactivate', () => {
    it('should call makeRequest with DELETE', async () => {
      mockedMakeRequest.mockResolvedValue({ id: 'user-1', isActive: false })

      const result = await usersService.deactivate('user-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/users/user-1',
        method: 'DELETE',
      })
      expect(result).toHaveProperty('isActive', false)
    })
  })

  describe('changePassword', () => {
    it('should call makeRequest with PATCH on the password path', async () => {
      mockedMakeRequest.mockResolvedValue({})

      await usersService.changePassword('user-1', 'novaSenha123')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/users/user-1/password',
        method: 'PATCH',
        body: { newPassword: 'novaSenha123' },
      })
    })
  })

  describe('listRoles', () => {
    it('should map GET /roles response to role options', async () => {
      mockedMakeRequest.mockResolvedValue({
        limit: 100,
        offset: 0,
        data: [
          { id: 'role-1', name: 'Porteiro', isAdmin: false, isActive: true },
          { id: 'role-2', name: 'Administração', isAdmin: true, isActive: true },
        ],
        count: 2,
      })

      const result = await usersService.listRoles()

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/roles?limit=100',
        method: 'GET',
      })
      expect(result).toEqual([
        { id: 'role-1', name: 'Porteiro', isAdmin: false, isActive: true },
        { id: 'role-2', name: 'Administração', isAdmin: true, isActive: true },
      ])
    })
  })
})
