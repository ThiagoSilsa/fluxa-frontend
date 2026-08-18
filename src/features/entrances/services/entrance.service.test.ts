import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entrancesService } from './entrance.service'

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
// EntrancesService
// ---------------------------------------------------------------------------
describe('EntrancesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should call makeRequest with GET on /entrances', async () => {
      const mockResponse = { limit: 20, offset: 0, data: [], count: 0 }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await entrancesService.list({})

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: expect.stringContaining('/entrances?'),
        method: 'GET',
      })
      expect(result).toEqual(mockResponse)
    })

    it('should include search, limit and offset in the query', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await entrancesService.list({ search: 'Principal', limit: 20, offset: 40 })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('search=Principal')
      expect(callArgs.endpoint).toContain('limit=20')
      expect(callArgs.endpoint).toContain('offset=40')
    })

    it('should include isActive in the query when provided', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await entrancesService.list({ isActive: false })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('isActive=false')
    })
  })

  describe('create', () => {
    it('should call makeRequest with POST and body', async () => {
      const payload = { name: 'Portaria Principal' }
      mockedMakeRequest.mockResolvedValue({ id: 'ent-1', ...payload, isActive: true })

      const result = await entrancesService.create(payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/entrances',
        method: 'POST',
        body: payload,
      })
      expect(result).toHaveProperty('id', 'ent-1')
    })
  })

  describe('update', () => {
    it('should call makeRequest with PATCH and body', async () => {
      const payload = { name: 'Atualizada', isActive: false }
      mockedMakeRequest.mockResolvedValue({ id: 'ent-1', ...payload })

      const result = await entrancesService.update('ent-1', payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/entrances/ent-1',
        method: 'PATCH',
        body: payload,
      })
      expect(result).toHaveProperty('name', 'Atualizada')
    })
  })

  describe('remove', () => {
    it('should call makeRequest with DELETE', async () => {
      mockedMakeRequest.mockResolvedValue('')

      await entrancesService.remove('ent-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/entrances/ent-1',
        method: 'DELETE',
      })
    })
  })
})
