// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { parseImportError } from './parse-import-error'

describe('parseImportError', () => {
  it('extrai linha e mensagem do padrão LINHA_{N}_{MSG}', () => {
    expect(parseImportError('LINHA_3_NAME_DEVE_TER_ENTRE_2_E_255_CARACTERES')).toEqual({
      line: 3,
      message: 'NAME_DEVE_TER_ENTRE_2_E_255_CARACTERES',
    })
  })

  it('devolve null para códigos que não são de linha', () => {
    expect(parseImportError('COLUNAS_OBRIGATORIAS_AUSENTES')).toBeNull()
    expect(parseImportError('')).toBeNull()
    expect(parseImportError('LINHA_ABC_MENSAGEM')).toBeNull()
  })
})
