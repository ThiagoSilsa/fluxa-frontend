import { describe, expect, it } from 'vitest'
import {
  ApiError,
  deriveServerCode,
  getAPIErrorTranslationKey,
  isApiError,
  translateApiCodeError,
  translateServerMessage,
} from './api-error'
import type { ApiErrorPayload } from '../types/api-error.types'
import { apiErrorKeyMap } from '../enum/api-error-key'

// i18n
import i18n from '#/shared/i18n'

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

  it('should translate a code derived from a backend message', () => {
    expect(translateApiCodeError({ code: 'VEICULO_NAO_ENCONTRADO', statusCode: 404 })).toBe(
      'errors.server.VEICULO_NAO_ENCONTRADO',
    )
    expect(translateApiCodeError({ code: 'QR_CODE_EXPIRADO', statusCode: 400 })).toBe(
      'errors.server.QR_CODE_EXPIRADO',
    )
  })

  it('should use the validation key for a 400 without code', () => {
    expect(translateApiCodeError({ statusCode: 400, message: 'Placa inválida' })).toBe(
      'errors.validation',
    )
  })

  it('should not use the validation key outside a 400', () => {
    expect(translateApiCodeError({ statusCode: 500 })).toBe('errors.generic')
  })
})

// ---------------------------------------------------------------------------
// deriveServerCode
// ---------------------------------------------------------------------------
describe('deriveServerCode', () => {
  it('should derive the code with the backend normalization', () => {
    expect(deriveServerCode('Veículo não cadastrado.')).toBe('VEICULO_NAO_CADASTRADO')
    expect(
      deriveServerCode('Já existe uma solicitação de bloqueio pendente para esta placa.'),
    ).toBe('JA_EXISTE_UMA_SOLICITACAO_DE_BLOQUEIO_PENDENTE_PARA_ESTA_PLACA')
    expect(deriveServerCode('Entrada já registrada.')).toBe('ENTRADA_JA_REGISTRADA')
  })

  it('should prefix codes that start with a digit', () => {
    expect(deriveServerCode('2 veículos')).toBe('ERROR_2_VEICULOS')
  })

  it('should return null without a usable message', () => {
    expect(deriveServerCode(null)).toBeNull()
    expect(deriveServerCode(undefined)).toBeNull()
    expect(deriveServerCode('')).toBeNull()
    expect(deriveServerCode(' ... ')).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// translateServerMessage
// ---------------------------------------------------------------------------
describe('translateServerMessage', () => {
  it('should translate a message the backend knows', () => {
    expect(translateServerMessage('Entrada registrada.', 'fallback')).toBe(
      'errors.server.ENTRADA_REGISTRADA',
    )
    expect(translateServerMessage('VEÍCULO PROIBIDO DE ENTRAR', 'fallback')).toBe(
      'errors.server.VEICULO_PROIBIDO_DE_ENTRAR',
    )
  })

  it('should use the fallback for a message without translation', () => {
    expect(translateServerMessage('Mensagem nova do backend.', 'fallback')).toBe('fallback')
  })

  it('should use the fallback without a message', () => {
    expect(translateServerMessage(null, 'fallback')).toBe('fallback')
    expect(translateServerMessage(undefined, 'fallback')).toBe('fallback')
  })
})

// ---------------------------------------------------------------------------
// apiErrorKeyMap
// ---------------------------------------------------------------------------
describe('apiErrorKeyMap', () => {
  it('tem texto nos três idiomas para cada código mapeado', () => {
    const codes = Object.keys(apiErrorKeyMap).map((code) => apiErrorKeyMap[code])

    for (const lng of ['pt', 'en', 'es']) {
      const untranslated = codes.filter((key) => !i18n.exists(key, { lng }))
      expect(untranslated).toEqual([])
    }
  })

  it('mapeia todos os códigos traduzidos no conjunto comum', () => {
    const bundle = i18n.getResourceBundle('pt', 'common') as {
      errors: { server: Record<string, string> }
    }
    const unmapped = Object.keys(bundle.errors.server).filter((code) => !(code in apiErrorKeyMap))

    expect(unmapped).toEqual([])
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
