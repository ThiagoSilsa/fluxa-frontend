// Vitest
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// i18n
import i18n from '#/shared/i18n'

// Component
import { JobDetailDialog } from './job-detail-dialog'

// Types
import type { ImportJobViewModel } from '../types/import.types'

// O detector de idioma pegaria o idioma do jsdom (en): as asserções abaixo são
// do texto em português.
beforeAll(async () => {
  await i18n.changeLanguage('pt')
})

/** Job falho com o erro informado (o resto é o mínimo para o diálogo). */
function failedJob(overrides: Partial<ImportJobViewModel>): ImportJobViewModel {
  return {
    id: 'job-1',
    type: 'DEPARTMENT',
    status: 'FAILED',
    totalRows: 10,
    processedRows: 3,
    successCount: 2,
    errorCount: 1,
    errorMessage: null,
    errorCode: null,
    errorParams: null,
    fileName: 'departamentos.xlsx',
    createdAt: '2026-08-20T10:00:00.000Z',
    startedAt: '2026-08-20T10:00:00.000Z',
    completedAt: '2026-08-20T10:00:05.000Z',
    duration: '5s',
    progressPercent: 30,
    isFinished: true,
    ...overrides,
  }
}

describe('JobDetailDialog', () => {
  it('monta o erro da linha pelo código e pelos parâmetros do job', () => {
    render(
      <JobDetailDialog
        job={failedJob({
          errorCode: 'NAME_LENGTH',
          errorParams: { line: 3, min: 5, max: 40 },
          errorMessage: 'Linha 3: name deve ter entre 2 e 255 caracteres.',
        })}
        open
        onOpenChange={vi.fn()}
      />,
    )

    // O texto sai dos parâmetros do job (5 e 40), não da mensagem gravada.
    expect(screen.getByText('Linha 3: name deve ter entre 5 e 40 caracteres.')).toBeTruthy()
    expect(screen.queryByText('Linha 3: name deve ter entre 2 e 255 caracteres.')).toBeNull()
  })

  it('nunca renderiza a mensagem em português gravada pelo servidor', () => {
    render(
      <JobDetailDialog
        job={failedJob({
          errorCode: 'SPREADSHEET_READ_ERROR',
          errorParams: {},
          errorMessage: 'ENOENT: no such file or directory',
        })}
        open
        onOpenChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Não foi possível ler o arquivo da planilha.')).toBeTruthy()
    expect(screen.queryByText('ENOENT: no such file or directory')).toBeNull()
  })

  it('job antigo sem código cai no genérico, mas mantém a linha', () => {
    render(
      <JobDetailDialog
        job={failedJob({ errorMessage: 'Linha 7: placa em formato inválido.' })}
        open
        onOpenChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Linha 7: não foi possível importar esta linha.')).toBeTruthy()
    expect(screen.queryByText('Linha 7: placa em formato inválido.')).toBeNull()
  })

  it('código sem tradução cai no genérico, mantendo a linha', () => {
    render(
      <JobDetailDialog
        job={failedJob({ errorCode: 'REGRA_NOVA_DA_PLANILHA', errorParams: { line: 2 } })}
        open
        onOpenChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Linha 2: não foi possível importar esta linha.')).toBeTruthy()
  })

  it('job concluído não mostra bloco de erro', () => {
    render(
      <JobDetailDialog
        job={failedJob({ status: 'DONE', errorCount: 0, errorMessage: null })}
        open
        onOpenChange={vi.fn()}
      />,
    )

    expect(screen.queryByText('Erro')).toBeNull()
  })
})
