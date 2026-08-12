import { describe, expect, it } from 'vitest'
import { ApiError, isApiError, translateApiCodeError, getAPIErrorTranslationKey } from './api-error'
import type { ApiErrorPayload } from '../types/api-error.types'

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------
describe('ApiError', () => {
  it('should create an error with default message', () => {
    const error = new ApiError()
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Erro na requisicao')
    expect(error.name).toBe('ApiError')
  })

  it('should create an error with payload', () => {
    const payload: ApiErrorPayload = {
      code: 'FORBIDDEN',
      message: 'Acesso negado',
      statusCode: 403,
    }
    const error = new ApiError(payload)
    expect(error.message).toBe('Acesso negado')
    expect(error.code).toBe('FORBIDDEN')
    expect(error.statusCode).toBe(403)
  })
})

// ---------------------------------------------------------------------------
// isApiError
// ---------------------------------------------------------------------------
describe('isApiError', () => {
  it('should return true for ApiError instances', () => {
    expect(isApiError(new ApiError())).toBe(true)
  })

  it('should return false for regular Error', () => {
    expect(isApiError(new Error('common'))).toBe(false)
  })

  it('should return false for null', () => {
    expect(isApiError(null)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// translateApiCodeError
// ---------------------------------------------------------------------------
describe('translateApiCodeError', () => {
  it('should return generic key when payload is null', () => {
    expect(translateApiCodeError(null)).toBe('errors.generic')
  })

  it('should return generic key when code is missing', () => {
    expect(translateApiCodeError({})).toBe('errors.generic')
  })

  it('should map known error codes', () => {
    expect(translateApiCodeError({ code: 'CREDENCIAIS_INVALIDAS' })).toBe(
      'errors.invalidCredentials',
    )
    expect(translateApiCodeError({ code: 'VALIDATION_ERROR' })).toBe('errors.validation')
    expect(translateApiCodeError({ code: 'UNEXPECTED_ERROR' })).toBe('errors.unexpected')
  })

  it('should return generic key for unknown code', () => {
    expect(translateApiCodeError({ code: 'UNKNOWN_CODE_XYZ' })).toBe('errors.generic')
  })
})

// ---------------------------------------------------------------------------
// getAPIErrorTranslationKey
// ---------------------------------------------------------------------------
describe('getAPIErrorTranslationKey', () => {
  it('should translate ApiError payload code', () => {
    const error = new ApiError({ code: 'CREDENCIAIS_INVALIDAS' })
    expect(getAPIErrorTranslationKey(error)).toBe('errors.invalidCredentials')
  })

  it('should return generic for non-ApiError', () => {
    expect(getAPIErrorTranslationKey(new Error('generic'))).toBe('errors.generic')
  })

  it('should return generic for random value', () => {
    expect(getAPIErrorTranslationKey('string')).toBe('errors.generic')
  })
})
