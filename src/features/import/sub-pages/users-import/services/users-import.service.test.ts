// Vitest
import { describe, expect, it, vi } from 'vitest'

// Controller
import baseController from '#/shared/controller/base.controller'

// Service
import { usersImportService } from './users-import.service'

describe('usersImportService', () => {
  it('upload envia FormData para /users/import', async () => {
    const makeRequest = vi
      .spyOn(baseController, 'makeRequest')
      .mockResolvedValue({ jobId: 'job-1', status: 'PENDING' })

    const file = new File(['x'], 'usuarios.xlsx')
    const result = await usersImportService.upload(file)

    expect(result).toEqual({ jobId: 'job-1', status: 'PENDING' })
    const [options] = makeRequest.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.endpoint).toBe('/users/import')
    expect(options.isFormData).toBe(true)
    makeRequest.mockRestore()
  })

  it('list filtra por type=USER com paginação', async () => {
    const makeRequest = vi
      .spyOn(baseController, 'makeRequest')
      .mockResolvedValue({ limit: 20, offset: 0, count: 0, data: [] })

    await usersImportService.list({ limit: 10, offset: 5 })

    const [options] = makeRequest.mock.calls[0]
    expect(options.endpoint).toBe('/import-jobs?type=USER&limit=10&offset=5')
    makeRequest.mockRestore()
  })
})
