// Vitest
import { describe, expect, it, vi } from 'vitest'

// Controller
import baseController from '#/shared/controller/base.controller'

// Service
import { vehiclesImportService } from './vehicles-import.service'

describe('vehiclesImportService', () => {
  it('upload envia FormData para /vehicles/import', async () => {
    const makeRequest = vi
      .spyOn(baseController, 'makeRequest')
      .mockResolvedValue({ jobId: 'job-1', status: 'PENDING' })

    const file = new File(['x'], 'veiculos.xlsx')
    const result = await vehiclesImportService.upload(file)

    expect(result).toEqual({ jobId: 'job-1', status: 'PENDING' })
    const [options] = makeRequest.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.endpoint).toBe('/vehicles/import')
    expect(options.isFormData).toBe(true)
    makeRequest.mockRestore()
  })

  it('list filtra por type=VEHICLE com paginação', async () => {
    const makeRequest = vi
      .spyOn(baseController, 'makeRequest')
      .mockResolvedValue({ limit: 20, offset: 0, count: 0, data: [] })

    await vehiclesImportService.list({ limit: 10, offset: 5 })

    const [options] = makeRequest.mock.calls[0]
    expect(options.endpoint).toBe('/import-jobs?type=VEHICLE&limit=10&offset=5')
    makeRequest.mockRestore()
  })
})
