import { beforeEach, describe, expect, it, vi } from 'vitest'
import { vehiclesService } from './vehicle.service'

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
// VehiclesService
// ---------------------------------------------------------------------------
describe('VehiclesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('should call makeRequest with GET on /vehicles', async () => {
      const mockResponse = { limit: 10, offset: 0, data: [], count: 0 }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await vehiclesService.list({})

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: expect.stringContaining('/vehicles?'),
        method: 'GET',
      })
      expect(result).toEqual(mockResponse)
    })

    it('should include filters, sort and pagination in the query', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 10, offset: 0, data: [], count: 0 })

      await vehiclesService.list({
        search: 'ABC',
        isActive: true,
        freePass: false,
        vehicleTypeId: 'type-1',
        departmentId: 'dept-1',
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        limit: 20,
        offset: 40,
      })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('search=ABC')
      expect(callArgs.endpoint).toContain('isActive=true')
      expect(callArgs.endpoint).toContain('freePass=false')
      expect(callArgs.endpoint).toContain('vehicleTypeId=type-1')
      expect(callArgs.endpoint).toContain('departmentId=dept-1')
      expect(callArgs.endpoint).toContain('sortBy=createdAt')
      expect(callArgs.endpoint).toContain('sortOrder=DESC')
      expect(callArgs.endpoint).toContain('limit=20')
      expect(callArgs.endpoint).toContain('offset=40')
    })
  })

  describe('create', () => {
    it('should call makeRequest with POST and body', async () => {
      const payload = { plate: 'ABC1D23', vehicleTypeId: 'type-1' }
      mockedMakeRequest.mockResolvedValue({ id: 'v-1', ...payload, isActive: true })

      const result = await vehiclesService.create(payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles',
        method: 'POST',
        body: payload,
      })
      expect(result).toHaveProperty('id', 'v-1')
    })
  })

  describe('update', () => {
    it('should call makeRequest with PATCH and body', async () => {
      const payload = { model: 'Onix', isActive: false }
      mockedMakeRequest.mockResolvedValue({ id: 'v-1', ...payload })

      const result = await vehiclesService.update('v-1', payload)

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles/v-1',
        method: 'PATCH',
        body: payload,
      })
      expect(result).toHaveProperty('model', 'Onix')
    })
  })

  describe('remove', () => {
    it('should call makeRequest with DELETE', async () => {
      mockedMakeRequest.mockResolvedValue('')

      await vehiclesService.remove('v-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles/v-1',
        method: 'DELETE',
      })
    })
  })

  describe('get', () => {
    it('should call makeRequest with GET on /vehicles/:id', async () => {
      const mockResponse = { id: 'v-1', plate: 'ABC1D23', department: null, drivers: [] }
      mockedMakeRequest.mockResolvedValue(mockResponse)

      const result = await vehiclesService.get('v-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles/v-1',
        method: 'GET',
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('setDepartment / removeDepartment', () => {
    it('should PUT the department link', async () => {
      mockedMakeRequest.mockResolvedValue({ id: 'vd-1', vehicleId: 'v-1', departmentId: 'd-1' })

      await vehiclesService.setDepartment('v-1', 'd-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles/v-1/department',
        method: 'PUT',
        body: { departmentId: 'd-1' },
      })
    })

    it('should DELETE the department link', async () => {
      mockedMakeRequest.mockResolvedValue('')

      await vehiclesService.removeDepartment('v-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles/v-1/department',
        method: 'DELETE',
      })
    })
  })

  describe('drivers', () => {
    it('should list drivers', async () => {
      mockedMakeRequest.mockResolvedValue({ vehicleId: 'v-1', drivers: [] })

      await vehiclesService.listDrivers('v-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles/v-1/drivers',
        method: 'GET',
      })
    })

    it('should add a driver with POST', async () => {
      mockedMakeRequest.mockResolvedValue({ id: 'uv-1' })

      await vehiclesService.addDriver('v-1', { userId: 'u-1', isPrimary: true })

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles/v-1/drivers',
        method: 'POST',
        body: { userId: 'u-1', isPrimary: true },
      })
    })

    it('should update a driver with PATCH', async () => {
      mockedMakeRequest.mockResolvedValue({ id: 'uv-1' })

      await vehiclesService.updateDriver('v-1', 'u-1', { canDrive: false })

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles/v-1/drivers/u-1',
        method: 'PATCH',
        body: { canDrive: false },
      })
    })

    it('should remove a driver with DELETE', async () => {
      mockedMakeRequest.mockResolvedValue('')

      await vehiclesService.removeDriver('v-1', 'u-1')

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles/v-1/drivers/u-1',
        method: 'DELETE',
      })
    })
  })

  describe('listDriverCandidates', () => {
    it('should call makeRequest with GET on /vehicles/driver-candidates', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await vehiclesService.listDriverCandidates({ search: 'joa', limit: 20, offset: 0 })

      const callArgs = mockedMakeRequest.mock.calls[0][0]
      expect(callArgs.endpoint).toContain('/vehicles/driver-candidates?')
      expect(callArgs.endpoint).toContain('search=joa')
      expect(callArgs.method).toBe('GET')
    })

    it('should omit query when no params', async () => {
      mockedMakeRequest.mockResolvedValue({ limit: 20, offset: 0, data: [], count: 0 })

      await vehiclesService.listDriverCandidates({})

      expect(mockedMakeRequest).toHaveBeenCalledWith({
        endpoint: '/vehicles/driver-candidates',
        method: 'GET',
      })
    })
  })
})
