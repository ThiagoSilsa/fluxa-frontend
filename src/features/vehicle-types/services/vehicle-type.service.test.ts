import { beforeEach, describe, expect, it, vi } from 'vitest'
import { vehicleTypesService } from './vehicle-type.service'

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
// VehicleTypesService
// ---------------------------------------------------------------------------
describe('VehicleTypesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should call makeRequest with GET on /vehicle-types', async () => {
      const mockResponse = { limit: 20, offset: 0, data: [], count: 0 }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await vehicleTypesService.list({})

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: expect.stringContaining('/vehicle-types?'),
        method: 'GET',
      })
      expect(result).toEqual(mockResponse)
    })

    it('should include search, limit and offset in the query', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await vehicleTypesService.list({ search: 'FRO', limit: 20, offset: 40 })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('search=FRO')
      expect(callArgs.endpoint).toContain('limit=20')
      expect(callArgs.endpoint).toContain('offset=40')
    })

    it('should include isActive and isFleet in the query when provided', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await vehicleTypesService.list({ isActive: false, isFleet: true })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('isActive=false')
      expect(callArgs.endpoint).toContain('isFleet=true')
    })
  })

  describe('create', () => {
    it('should call makeRequest with POST and body', async () => {
      const payload = { code: 'UTILITARIO', name: 'Utilitário', isFleet: true }
      mockedMakeRequest.mockResolvedValue({ id: 'type-1', ...payload, isActive: true })

      const result = await vehicleTypesService.create(payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicle-types',
        method: 'POST',
        body: payload,
      })
      expect(result).toHaveProperty('id', 'type-1')
    })
  })

  describe('update', () => {
    it('should call makeRequest with PATCH and body', async () => {
      const payload = { name: 'Atualizado', isActive: false }
      mockedMakeRequest.mockResolvedValue({ id: 'type-1', ...payload })

      const result = await vehicleTypesService.update('type-1', payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicle-types/type-1',
        method: 'PATCH',
        body: payload,
      })
      expect(result).toHaveProperty('name', 'Atualizado')
    })
  })

  describe('remove', () => {
    it('should call makeRequest with DELETE', async () => {
      mockedMakeRequest.mockResolvedValue('')

      await vehicleTypesService.remove('type-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicle-types/type-1',
        method: 'DELETE',
      })
    })
  })
})
