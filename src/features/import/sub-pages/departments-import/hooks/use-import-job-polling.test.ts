import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { useImportJobPolling } from './use-import-job-polling'

import type { ReactNode } from 'react'

const mockGetJob = vi.fn()
vi.mock('../services/departments-import.service', () => ({
  departmentsImportService: { getJob: (...args: unknown[]) => mockGetJob(...args) },
}))

function createWrapper({ children }: { children: ReactNode }) {
  return React.createElement('div', null, children)
}

describe('useImportJobPolling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('sem jobId: job null e sem polling', () => {
    const { result } = renderHook(() => useImportJobPolling(null), {
      wrapper: createWrapper,
    })

    expect(result.current.job).toBeNull()
    expect(result.current.isPolling).toBe(false)
  })

  it('job finalizado na primeira leitura: atualiza e para o polling', async () => {
    mockGetJob.mockResolvedValue({
      id: 'job-1',
      type: 'DEPARTMENT',
      status: 'DONE',
      totalRows: 3,
      processedRows: 3,
      successCount: 3,
      errorCount: 0,
      errorMessage: null,
      fileName: 'departamentos.xlsx',
      createdAt: '2026-08-20T10:00:00.000Z',
      startedAt: null,
      completedAt: '2026-08-20T10:00:05.000Z',
    })

    const { result } = renderHook(() => useImportJobPolling('job-1'), {
      wrapper: createWrapper,
    })

    await waitFor(() => expect(result.current.job?.isFinished).toBe(true))
    expect(mockGetJob).toHaveBeenCalledWith('job-1')
    expect(result.current.job?.status).toBe('DONE')
  })

  it('job PROCESSING: devolve progresso e mantém polling', async () => {
    mockGetJob.mockResolvedValue({
      id: 'job-1',
      type: 'DEPARTMENT',
      status: 'PROCESSING',
      totalRows: 10,
      processedRows: 4,
      successCount: 4,
      errorCount: 0,
      errorMessage: null,
      fileName: 'departamentos.xlsx',
      createdAt: '2026-08-20T10:00:00.000Z',
      startedAt: '2026-08-20T10:00:00.000Z',
      completedAt: null,
    })

    const { result } = renderHook(() => useImportJobPolling('job-1'), {
      wrapper: createWrapper,
    })

    await waitFor(() => expect(result.current.job?.status).toBe('PROCESSING'))
    expect(result.current.job?.isFinished).toBe(false)
    expect(result.current.job?.progressPercent).toBe(40)
  })
})
