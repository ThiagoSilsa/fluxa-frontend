import { describe, expect, it } from 'vitest'
import {
  getBlockRequestStatusLabelKey,
  getBlockStatusLabelKey,
  getBlockTypeLabelKey,
} from './block.lib'

describe('getBlockStatusLabelKey', () => {
  it('mapeia os status de bloqueio', () => {
    expect(getBlockStatusLabelKey('ACTIVE')).toBe('blockStatus.ACTIVE')
    expect(getBlockStatusLabelKey('REVOKED')).toBe('blockStatus.REVOKED')
  })
})

describe('getBlockTypeLabelKey', () => {
  it('mapeia os tipos de bloqueio', () => {
    expect(getBlockTypeLabelKey('MANUAL')).toBe('blockType.MANUAL')
    expect(getBlockTypeLabelKey('AUTOMATIC')).toBe('blockType.AUTOMATIC')
  })
})

describe('getBlockRequestStatusLabelKey', () => {
  it('mapeia os status de solicitação', () => {
    expect(getBlockRequestStatusLabelKey('PENDING')).toBe('requestStatus.PENDING')
    expect(getBlockRequestStatusLabelKey('APPROVED')).toBe('requestStatus.APPROVED')
    expect(getBlockRequestStatusLabelKey('REJECTED')).toBe('requestStatus.REJECTED')
    expect(getBlockRequestStatusLabelKey('CANCELLED')).toBe('requestStatus.CANCELLED')
  })
})
