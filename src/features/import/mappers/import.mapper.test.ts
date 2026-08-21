// Vitest
import { describe, expect, it } from 'vitest'

// Mappers
import { normalizeImportJob } from './import.mapper'

// Types
import type { ImportJobEntity } from '../types/import.types'

describe('normalizeImportJob', () => {
  const base: ImportJobEntity = {
    id: 'job-1',
    type: 'DEPARTMENT',
    status: 'DONE',
    totalRows: 10,
    processedRows: 10,
    successCount: 10,
    errorCount: 0,
    errorMessage: null,
    fileName: 'departamentos.xlsx',
    createdAt: '2026-08-20T10:00:00.000Z',
    startedAt: '2026-08-20T10:00:00.000Z',
    completedAt: '2026-08-20T10:00:05.000Z',
  }

  it('calcula progresso, finalização e duração', () => {
    const view = normalizeImportJob(base)

    expect(view.progressPercent).toBe(100)
    expect(view.isFinished).toBe(true)
    expect(view.duration).toBe('5s')
    expect(view.fileName).toBe('departamentos.xlsx')
  })

  it('preserva processedRows (0 é um valor válido de contador)', () => {
    const view = normalizeImportJob({ ...base, processedRows: 0 })

    expect(view.processedRows).toBe(0)
  })

  it('progresso parcial e job não finalizado', () => {
    const view = normalizeImportJob({
      ...base,
      status: 'PROCESSING',
      totalRows: 10,
      processedRows: 4,
      completedAt: null,
    })

    expect(view.progressPercent).toBe(40)
    expect(view.isFinished).toBe(false)
    expect(view.duration).toBeNull()
  })

  it('progresso 0 quando não há linhas', () => {
    const view = normalizeImportJob({ ...base, totalRows: 0 })

    expect(view.progressPercent).toBe(0)
  })

  it('job FAILED é finalizado e com duração', () => {
    const view = normalizeImportJob({
      ...base,
      status: 'FAILED',
      successCount: 0,
      errorCount: 1,
      errorMessage: 'Linha 2: name inválido.',
      completedAt: '2026-08-20T10:00:03.000Z',
    })

    expect(view.isFinished).toBe(true)
    expect(view.errorMessage).toBe('Linha 2: name inválido.')
    expect(view.duration).toBe('3s')
  })

  it('fileName vazio vira "-"', () => {
    const view = normalizeImportJob({ ...base, fileName: null })

    expect(view.fileName).toBe('-')
  })

  it('formata durações maiores que um minuto', () => {
    const view = normalizeImportJob({
      ...base,
      createdAt: '2026-08-20T10:00:00.000Z',
      completedAt: '2026-08-20T10:02:45.000Z',
    })

    expect(view.duration).toBe('2min 45s')
  })
})
