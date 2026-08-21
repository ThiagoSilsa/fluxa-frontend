// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { buildRulesRows } from './build-rules-rows.lib'

describe('buildRulesRows', () => {
  const t = (key: string): string => key

  it('monta o cabeçalho e as linhas das regras', () => {
    const rows = buildRulesRows(
      [
        { column: 'name', required: true, rules: ['Entre 2 e 255 caracteres'] },
        { column: 'description', required: false, rules: [] },
      ],
      t as never,
    )

    expect(rows).toEqual([
      ['rules.headers.column', 'rules.headers.required', 'rules.headers.rules'],
      ['name', 'rules.yes', 'Entre 2 e 255 caracteres'],
      ['description', 'rules.no', ''],
    ])
  })
})
