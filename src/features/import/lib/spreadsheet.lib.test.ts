// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { buildWorkbook, rowsFromObjects, sanitizeSheetName } from './spreadsheet.lib'

describe('rowsFromObjects', () => {
  it('usa as chaves na ordem de aparição quando não há headers', () => {
    expect(
      rowsFromObjects([
        { name: 'A', parkingSpace: 1 },
        { name: 'B', parkingSpace: 2 },
      ]),
    ).toEqual([
      ['name', 'parkingSpace'],
      ['A', 1],
      ['B', 2],
    ])
  })

  it('respeita a ordem informada em headers e preenche com ""', () => {
    expect(rowsFromObjects([{ name: 'A', color: 'preto' }], ['name', 'color', 'size'])).toEqual([
      ['name', 'color', 'size'],
      ['A', 'preto', ''],
    ])
  })

  it('devolve só o cabeçalho quando não há itens', () => {
    expect(rowsFromObjects([], ['name'])).toEqual([['name']])
  })
})

describe('sanitizeSheetName', () => {
  it('limita a 31 caracteres', () => {
    expect(sanitizeSheetName('a'.repeat(50))).toHaveLength(31)
  })

  it('substitui caracteres inválidos por "-"', () => {
    expect(sanitizeSheetName('a:b?c')).toBe('a-b-c')
  })
})

describe('buildWorkbook', () => {
  it('gera um Blob XLSX com as abas informadas', async () => {
    const blob = await buildWorkbook([{ name: 'data', rows: [['name'], ['Recepção']] }])

    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(blob.size).toBeGreaterThan(0)
  })
})
