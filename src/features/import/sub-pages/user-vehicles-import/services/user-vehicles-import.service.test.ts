// Vitest
import { describe, expect, it, vi } from 'vitest'

// Controller
import baseController from '#/shared/controller/base.controller'

// Service
import { userVehiclesImportService } from './user-vehicles-import.service'

describe('userVehiclesImportService', () => {
  it('upload envia FormData para /user-vehicles/import', async () => {
    const makeRequest = vi
      .spyOn(baseController, 'makeRequest')
      .mockResolvedValue({ jobId: 'job-1', status: 'PENDING' })

    const file = new File(['x'], 'vinculos.xlsx')
    const result = await userVehiclesImportService.upload(file)

    expect(result).toEqual({ jobId: 'job-1', status: 'PENDING' })
    const [options] = makeRequest.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.endpoint).toBe('/user-vehicles/import')
    expect(options.isFormData).toBe(true)
    makeRequest.mockRestore()
  })

  it('list filtra por type=USER_VEHICLE com paginação', async () => {
    const makeRequest = vi
      .spyOn(baseController, 'makeRequest')
      .mockResolvedValue({ limit: 20, offset: 0, count: 0, data: [] })

    await userVehiclesImportService.list({ limit: 10, offset: 5 })

    const [options] = makeRequest.mock.calls[0]
    expect(options.endpoint).toBe('/import-jobs?type=USER_VEHICLE&limit=10&offset=5')
    makeRequest.mockRestore()
  })
})
