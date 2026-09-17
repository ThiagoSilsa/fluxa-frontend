// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { resolveImportJobError } from './import-error.lib'

// Types
import type { ImportJobErrorInput } from '../types/import.types'

/** Job sem erro (base dos cenários). */
const EMPTY: ImportJobErrorInput = { errorCode: null, errorParams: null, errorMessage: null }

describe('resolveImportJobError', () => {
  it('usa o texto da regra quando o código tem tradução, com os parâmetros do job', () => {
    expect(
      resolveImportJobError({
        ...EMPTY,
        errorCode: 'NAME_LENGTH',
        errorParams: { line: 3, min: 2, max: 255 },
        errorMessage: 'Linha 3: name deve ter entre 2 e 255 caracteres.',
      }),
    ).toEqual({
      key: 'common:errors.server.NAME_LENGTH',
      params: { line: 3, min: 2, max: 255 },
    })
  })

  it('código conhecido sem parâmetros sai com parâmetros vazios', () => {
    expect(
      resolveImportJobError({
        ...EMPTY,
        errorCode: 'SPREADSHEET_EMPTY',
        errorMessage: 'A planilha está vazia.',
      }),
    ).toEqual({ key: 'common:errors.server.SPREADSHEET_EMPTY', params: {} })
  })

  it('código sem tradução cai no genérico mantendo a linha', () => {
    expect(
      resolveImportJobError({
        ...EMPTY,
        errorCode: 'REGRA_NOVA_DA_PLANILHA',
        errorParams: { line: 7 },
      }),
    ).toEqual({ key: 'import:detail.error-line', params: { line: 7 } })
  })

  it('código sem tradução e sem linha cai no genérico', () => {
    expect(resolveImportJobError({ ...EMPTY, errorCode: 'REGRA_NOVA_DA_PLANILHA' })).toEqual({
      key: 'import:detail.error-generic',
      params: {},
    })
  })

  it('job antigo (sem código) recupera a linha da mensagem persistida, sem exibi-la', () => {
    const resolved = resolveImportJobError({
      ...EMPTY,
      errorMessage: 'Linha 12: placa em formato inválido.',
    })

    expect(resolved).toEqual({ key: 'import:detail.error-line', params: { line: 12 } })
    expect(JSON.stringify(resolved)).not.toContain('placa')
  })

  it('job antigo sem linha na mensagem cai no genérico', () => {
    expect(resolveImportJobError({ ...EMPTY, errorMessage: 'A planilha está vazia.' })).toEqual({
      key: 'import:detail.error-generic',
      params: {},
    })
  })

  it('job sem erro nenhum não tem texto', () => {
    expect(resolveImportJobError(EMPTY)).toBeNull()
  })

  it('a mensagem em português do servidor nunca vira texto de tela', () => {
    const resolved = resolveImportJobError({
      ...EMPTY,
      errorCode: 'EMAIL_ALREADY_LINKED',
      errorParams: { line: 2, email: 'vinculado@somar.local' },
      errorMessage: 'Linha 2: usuário com e-mail "vinculado@somar.local" já está vinculado.',
    })

    expect(resolved?.key).toBe('common:errors.server.EMAIL_ALREADY_LINKED')
    expect(resolved?.key).not.toContain('usuário')
  })
})
