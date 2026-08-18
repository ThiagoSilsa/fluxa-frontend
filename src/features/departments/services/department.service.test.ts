import { beforeEach, describe, expect, it, vi } from 'vitest'
import { departmentsService } from './department.service'

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
// DepartmentsService
// ---------------------------------------------------------------------------
describe('DepartmentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should call makeRequest with GET on /departments', async () => {
      const mockResponse = { limit: 20, offset: 0, data: [], count: 0 }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await departmentsService.list({})

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: expect.stringContaining('/departments?'),
        method: 'GET',
      })
      expect(result).toEqual(mockResponse)
    })

    it('should include search, limit and offset in the query', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await departmentsService.list({ search: 'Recep', limit: 20, offset: 40 })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('search=Recep')
      expect(callArgs.endpoint).toContain('limit=20')
      expect(callArgs.endpoint).toContain('offset=40')
    })

    it('should include isActive in the query when provided', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await departmentsService.list({ isActive: false })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('isActive=false')
    })
  })

  describe('create', () => {
    it('should call makeRequest with POST and body', async () => {
      const payload = { name: 'Recepção', parkingSpace: 30 }
      mockedMakeRequest.mockResolvedValue({ id: 'dept-1', ...payload, isActive: true })

      const result = await departmentsService.create(payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/departments',
        method: 'POST',
        body: payload,
      })
      expect(result).toHaveProperty('id', 'dept-1')
    })
  })

  describe('update', () => {
    it('should call makeRequest with PATCH and body', async () => {
      const payload = { name: 'Atualizado', isActive: false }
      mockedMakeRequest.mockResolvedValue({ id: 'dept-1', ...payload })

      const result = await departmentsService.update('dept-1', payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/departments/dept-1',
        method: 'PATCH',
        body: payload,
      })
      expect(result).toHaveProperty('name', 'Atualizado')
    })
  })

  describe('remove', () => {
    it('should call makeRequest with DELETE', async () => {
      mockedMakeRequest.mockResolvedValue('')

      await departmentsService.remove('dept-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/departments/dept-1',
        method: 'DELETE',
      })
    })
  })
})
