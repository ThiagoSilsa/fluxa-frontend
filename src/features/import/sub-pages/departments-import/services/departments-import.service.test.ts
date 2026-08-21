// Vitest
import { describe, expect, it, vi } from 'vitest'

// Controller
import baseController from '#/shared/controller/base.controller'

// Types
import type { ImportJobResponse } from '#/features/import/types/import.types'

// Service
import { departmentsImportService } from './departments-import.service'

describe('departmentsImportService', () => {
  it('upload envia FormData para /departments/import', async () => {
    const makeRequest = vi
      .spyOn(baseController, 'makeRequest')
      .mockResolvedValue({ jobId: 'job-1', status: 'PENDING' })

    const file = new File(['x'], 'departamentos.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const result = await departmentsImportService.upload(file)

    expect(result).toEqual({ jobId: 'job-1', status: 'PENDING' })
    const [options] = makeRequest.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.endpoint).toBe('/departments/import')
    expect(options.isFormData).toBe(true)
    expect(options.body).toBeInstanceOf(FormData)
    makeRequest.mockRestore()
  })

  it('list filtra por type=DEPARTMENT com paginação', async () => {
    const makeRequest = vi
      .spyOn(baseController, 'makeRequest')
      .mockResolvedValue({ limit: 20, offset: 0, count: 0, data: [] })

    await departmentsImportService.list({ limit: 10, offset: 5 })

    const [options] = makeRequest.mock.calls[0]
    expect(options.endpoint).toBe('/import-jobs?type=DEPARTMENT&limit=10&offset=5')
    makeRequest.mockRestore()
  })

  it('getJob busca o status do job', async () => {
    const makeRequest = vi
      .spyOn(baseController, 'makeRequest')
      .mockResolvedValue({ id: 'job-1', status: 'DONE' })

    const result = await departmentsImportService.getJob('job-1')

    expect(result.status).toBe('DONE')
    const [options] = makeRequest.mock.calls[0]
    expect(options.endpoint).toBe('/import-jobs/job-1')
    makeRequest.mockRestore()
  })
})
