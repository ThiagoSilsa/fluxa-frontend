import { describe, expect, it } from 'vitest'
import { getAccessRequestStatusLabelKey, getAccessRequestTypeLabelKey } from './access-request.lib'

describe('getAccessRequestTypeLabelKey', () => {
  it('mapeia cada cenário para a chave do namespace', () => {
    expect(getAccessRequestTypeLabelKey('NEW_USER')).toBe('type.NEW_USER')
    expect(getAccessRequestTypeLabelKey('NEW_VEHICLE')).toBe('type.NEW_VEHICLE')
    expect(getAccessRequestTypeLabelKey('LINK')).toBe('type.LINK')
    expect(getAccessRequestTypeLabelKey('BOTH')).toBe('type.BOTH')
  })
})

describe('getAccessRequestStatusLabelKey', () => {
  it('mapeia cada status para a chave do namespace', () => {
    expect(getAccessRequestStatusLabelKey('PENDING')).toBe('status.PENDING')
    expect(getAccessRequestStatusLabelKey('IN_CONTACT')).toBe('status.IN_CONTACT')
    expect(getAccessRequestStatusLabelKey('REGISTERED')).toBe('status.REGISTERED')
    expect(getAccessRequestStatusLabelKey('REJECTED')).toBe('status.REJECTED')
    expect(getAccessRequestStatusLabelKey('CANCELLED')).toBe('status.CANCELLED')
  })
})
