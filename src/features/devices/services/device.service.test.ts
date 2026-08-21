import { beforeEach, describe, expect, it, vi } from 'vitest'
import { devicesService } from './device.service'

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
// DevicesService
// ---------------------------------------------------------------------------
describe('DevicesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('chama makeRequest com GET em /devices', async () => {
      const mockResponse = { limit: 20, offset: 0, data: [], count: 0 }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await devicesService.list({})

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: expect.stringContaining('/devices?'),
        method: 'GET',
      })
      expect(result).toEqual(mockResponse)
    })

    it('inclui busca, filtro e ordenação na query', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await devicesService.list({
        search: 'Tablet',
        isActive: true,
        sortBy: 'lastSyncAt',
        sortOrder: 'DESC',
        limit: 10,
        offset: 20,
      })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('search=Tablet')
      expect(callArgs.endpoint).toContain('isActive=true')
      expect(callArgs.endpoint).toContain('sortBy=lastSyncAt')
      expect(callArgs.endpoint).toContain('sortOrder=DESC')
      expect(callArgs.endpoint).toContain('limit=10')
      expect(callArgs.endpoint).toContain('offset=20')
    })
  })

  describe('create', () => {
    it('chama makeRequest com POST e body', async () => {
      const mockResponse = {
        device: { id: 'device-1', name: 'Tablet' },
        token: 'a'.repeat(32),
      }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await devicesService.create({ name: 'Tablet', platform: 'ANDROID' })

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/devices',
        method: 'POST',
        body: { name: 'Tablet', platform: 'ANDROID' },
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('update', () => {
    it('chama makeRequest com PATCH e body parcial', async () => {
      mockedMakeRequest.mockResolvedValue({ id: 'device-1', name: 'Renomeado' })

      await devicesService.update('device-1', { name: 'Renomeado', isActive: false })

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/devices/device-1',
        method: 'PATCH',
        body: { name: 'Renomeado', isActive: false },
      })
    })
  })

  describe('remove', () => {
    it('chama makeRequest com DELETE (204)', async () => {
      mockedMakeRequest.mockResolvedValue(undefined)

      await devicesService.remove('device-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/devices/device-1',
        method: 'DELETE',
      })
    })
  })

  describe('rotateToken', () => {
    it('chama makeRequest com POST em rotate-token', async () => {
      const mockResponse = {
        device: { id: 'device-1' },
        token: 'b'.repeat(32),
      }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await devicesService.rotateToken('device-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/devices/device-1/rotate-token',
        method: 'POST',
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
