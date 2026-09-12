import { describe, expect, it } from 'vitest'
import {
  ALL_ENTRANCES_FILTER,
  canRegisterDenial,
  canRegisterEntry,
  canRegisterExit,
  formatDateTime,
  getDenialReasonLabelKey,
  getOccupancyTone,
  getRecordEntranceOptions,
  getVerdictLabelKey,
  getVerdictReasonNameKey,
  isVerdictAllow,
  resolveEntranceFilter,
  verdictTone,
} from './access.lib'

// Shared
import { PermissionCode } from '#/shared/enum/permission-code'

// Types
import type { AccessVerdict } from '../types/access.types'

describe('getDenialReasonLabelKey', () => {
  it('mapeia cada motivo para a chave do namespace access', () => {
    expect(getDenialReasonLabelKey('BLOCKED')).toBe('denial.reasons.BLOCKED')
    expect(getDenialReasonLabelKey('UNREGISTERED')).toBe('denial.reasons.UNREGISTERED')
    expect(getDenialReasonLabelKey('UNAUTHORIZED_DRIVER')).toBe(
      'denial.reasons.UNAUTHORIZED_DRIVER',
    )
    expect(getDenialReasonLabelKey('OVERDUE')).toBe('denial.reasons.OVERDUE')
    expect(getDenialReasonLabelKey('OTHER')).toBe('denial.reasons.OTHER')
  })
})

describe('getVerdictLabelKey', () => {
  it('sem motivo devolve o rótulo genérico do veredito', () => {
    expect(getVerdictLabelKey('ALLOW')).toBe('verdict.labels.ALLOW')
    expect(getVerdictLabelKey('DENY_BLOCKED', null)).toBe('verdict.labels.DENY_BLOCKED')
    expect(getVerdictLabelKey('ALLOW_WITH_REQUEST', undefined)).toBe(
      'verdict.labels.ALLOW_WITH_REQUEST',
    )
  })

  it('refina o rótulo quando o motivo muda o texto', () => {
    expect(getVerdictLabelKey('ALLOW', 'FREE_PASS')).toBe('verdict.reasons.ALLOW.FREE_PASS')
    expect(getVerdictLabelKey('ALLOW', 'DRIVER_ALLOWED')).toBe(
      'verdict.reasons.ALLOW.DRIVER_ALLOWED',
    )
    expect(getVerdictLabelKey('ALLOW_WITH_REQUEST', 'REQUEST_OPEN')).toBe(
      'verdict.reasons.ALLOW_WITH_REQUEST.REQUEST_OPEN',
    )
    expect(getVerdictLabelKey('ALLOW_WITH_REQUEST', 'UNREGISTERED_DRIVER')).toBe(
      'verdict.reasons.ALLOW_WITH_REQUEST.UNREGISTERED_DRIVER',
    )
    expect(getVerdictLabelKey('DENY_OVERDUE', 'REQUEST_OVERDUE')).toBe(
      'verdict.reasons.DENY_OVERDUE.REQUEST_OVERDUE',
    )
  })

  it('ignora motivo que não pertence ao veredito (motivo combinado)', () => {
    // `ALLOW_WITH_REQUEST` + `FREE_PASS` pode vir do backend: o tom/texto
    // continua sendo o do veredito, não o de passe livre.
    expect(getVerdictLabelKey('ALLOW_WITH_REQUEST', 'FREE_PASS')).toBe(
      'verdict.labels.ALLOW_WITH_REQUEST',
    )
    expect(getVerdictLabelKey('DENY_BLOCKED', 'CAPACITY_FULL')).toBe('verdict.labels.DENY_BLOCKED')
  })
})

describe('getVerdictReasonNameKey', () => {
  it('devolve o nome genérico do motivo (chips da ficha)', () => {
    expect(getVerdictReasonNameKey('FREE_PASS')).toBe('verdict.reasonNames.FREE_PASS')
    expect(getVerdictReasonNameKey('DRIVER_NOT_ALLOWED')).toBe(
      'verdict.reasonNames.DRIVER_NOT_ALLOWED',
    )
    expect(getVerdictReasonNameKey('CAPACITY_FULL')).toBe('verdict.reasonNames.CAPACITY_FULL')
  })
})

describe('verdictTone', () => {
  it('classifica liberado / atenção / impedido', () => {
    const cases: Array<[AccessVerdict, string]> = [
      ['ALLOW', 'success'],
      ['ALLOW_WITH_REQUEST', 'warning'],
      ['ALLOW_OVER_CAPACITY', 'warning'],
      ['ALLOW_FORCED_REENTRY', 'warning'],
      ['DENY_BLOCKED', 'destructive'],
      ['DENY_OVERDUE', 'destructive'],
      ['DENY_INACTIVE', 'destructive'],
    ]

    cases.forEach(([verdict, tone]) => {
      expect(verdictTone(verdict)).toBe(tone)
    })
  })
})

describe('isVerdictAllow', () => {
  it('é true apenas para os vereditos ALLOW_*', () => {
    const allows: AccessVerdict[] = [
      'ALLOW',
      'ALLOW_WITH_REQUEST',
      'ALLOW_OVER_CAPACITY',
      'ALLOW_FORCED_REENTRY',
    ]
    const denies: AccessVerdict[] = ['DENY_BLOCKED', 'DENY_OVERDUE', 'DENY_INACTIVE']

    allows.forEach((verdict) => expect(isVerdictAllow(verdict)).toBe(true))
    denies.forEach((verdict) => expect(isVerdictAllow(verdict)).toBe(false))
  })
})

describe('canRegisterEntry/Exit/Denial', () => {
  const all = [
    PermissionCode.REGISTER_ENTRY,
    PermissionCode.REGISTER_EXIT,
    PermissionCode.REGISTER_DENIAL,
  ]

  it('libera cada ação com a sua permissão', () => {
    expect(canRegisterEntry(all)).toBe(true)
    expect(canRegisterExit(all)).toBe(true)
    expect(canRegisterDenial(all)).toBe(true)
  })

  it('não libera ação sem a permissão correspondente', () => {
    const onlyEntry = [PermissionCode.REGISTER_ENTRY]

    expect(canRegisterEntry(onlyEntry)).toBe(true)
    expect(canRegisterExit(onlyEntry)).toBe(false)
    expect(canRegisterDenial(onlyEntry)).toBe(false)
  })

  it('trata lista ausente como sem permissão (sessão incompleta)', () => {
    expect(canRegisterEntry(undefined)).toBe(false)
    expect(canRegisterExit(undefined)).toBe(false)
    expect(canRegisterDenial(undefined)).toBe(false)
  })
})

describe('getOccupancyTone', () => {
  it('devolve null sem capacidade', () => {
    expect(getOccupancyTone(null)).toBeNull()
  })
  it('classifica safe/warning/danger pelos limites', () => {
    expect(getOccupancyTone(0)).toBe('safe')
    expect(getOccupancyTone(79)).toBe('safe')
    expect(getOccupancyTone(80)).toBe('warning')
    expect(getOccupancyTone(100)).toBe('warning')
    expect(getOccupancyTone(101)).toBe('danger')
  })
})

describe('getRecordEntranceOptions', () => {
  it('extrai as portarias ativas do metadado entrance_id', () => {
    const options = getRecordEntranceOptions([
      { key: 'other_id', label: 'Outro', allowed_values: [{ id: 'x', name: 'X' }] },
      {
        key: 'entrance_id',
        label: 'Portaria',
        allowed_values: [
          { id: 'e1', name: 'Portaria 1' },
          { id: 'e2', name: 'Portaria 2' },
        ],
      },
    ])

    expect(options).toEqual([
      { id: 'e1', name: 'Portaria 1' },
      { id: 'e2', name: 'Portaria 2' },
    ])
  })

  it('devolve lista vazia sem parameters ou sem a chave', () => {
    expect(getRecordEntranceOptions(undefined)).toEqual([])
    expect(getRecordEntranceOptions([{ key: 'other_id', label: 'Outro' }])).toEqual([])
    expect(getRecordEntranceOptions([{ key: 'entrance_id', label: 'Portaria' }])).toEqual([])
  })
})

describe('resolveEntranceFilter', () => {
  it('usa a escolha explícita do filtro na URL', () => {
    expect(resolveEntranceFilter('entrance-1', 'entrance-2')).toBe('entrance-1')
  })

  it('cai na portaria do dispositivo quando o filtro não foi escolhido', () => {
    expect(resolveEntranceFilter(undefined, 'entrance-2')).toBe('entrance-2')
  })

  it('trata all como "todas as portarias", vencendo o dispositivo', () => {
    expect(resolveEntranceFilter(ALL_ENTRANCES_FILTER, 'entrance-2')).toBeUndefined()
    expect(resolveEntranceFilter(ALL_ENTRANCES_FILTER, null)).toBeUndefined()
  })

  it('sem filtro e sem portaria no dispositivo não filtra nada', () => {
    expect(resolveEntranceFilter(undefined, null)).toBeUndefined()
  })
})

describe('formatDateTime', () => {
  it('formata um instante ISO em data/hora local', () => {
    const result = formatDateTime('2026-08-21T14:30:00.000Z')
    // O separador data/hora varia por ambiente/ICU (espaço, vírgula ou ambos).
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}[, ]+\d{2}:\d{2}/)
  })

  it('devolve traço para null/undefined', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime(undefined)).toBe('—')
  })

  it('devolve traço para data inválida', () => {
    expect(formatDateTime('data-invalida')).toBe('—')
  })
})
