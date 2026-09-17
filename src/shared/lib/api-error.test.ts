import { describe, expect, it } from 'vitest'
import {
  ApiError,
  VALIDATION_RULE_CODES,
  getAPIErrorTranslationKey,
  isApiError,
  readValidationItems,
  translateApiCodeError,
  translateApiError,
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
    expect(translateApiCodeError({ code: 'VALIDATION_ERROR' })).toBe('errors.validation.generic')
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
      'errors.validation.generic',
    )
  })

  it('should not use the validation key outside a 400', () => {
    expect(translateApiCodeError({ statusCode: 500 })).toBe('errors.generic')
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

// ---------------------------------------------------------------------------
// readValidationItems
// ---------------------------------------------------------------------------
describe('readValidationItems', () => {
  it('lê campo, regra e parâmetros de cada violação', () => {
    expect(
      readValidationItems({
        details: [
          { field: 'email', code: 'INVALID_EMAIL' },
          { field: 'name', code: 'MAX_LENGTH', params: { max: 100 } },
        ],
      }),
    ).toEqual([
      {
        fieldLabelKey: 'fields.email',
        field: 'email',
        ruleKey: 'errors.validation.INVALID_EMAIL',
        params: {},
      },
      {
        fieldLabelKey: 'fields.name',
        field: 'name',
        ruleKey: 'errors.validation.MAX_LENGTH',
        params: { max: 100 },
      },
    ])
  })

  it('usa o último segmento do caminho pontuado (DTO aninhado)', () => {
    const [item] = readValidationItems({
      details: [{ field: 'payload.driver.email', code: 'REQUIRED' }],
    })

    expect(item.fieldLabelKey).toBe('fields.email')
    expect(item.field).toBe('email')
  })

  it('código de regra desconhecido cai no genérico', () => {
    const [item] = readValidationItems({ details: [{ field: 'name', code: 'REGRA_NOVA' }] })

    expect(item.ruleKey).toBe('errors.validation.unknown')
  })

  it('sem details (ou com details vazio) não há violação', () => {
    expect(readValidationItems(undefined)).toEqual([])
    expect(readValidationItems(null)).toEqual([])
    expect(readValidationItems({ statusCode: 400, message: 'Erro de validação' })).toEqual([])
    expect(readValidationItems({ details: [] })).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// translateApiError
// ---------------------------------------------------------------------------
describe('translateApiError', () => {
  const t = i18n.getFixedT('pt', 'common')

  it('agrega as violações num texto só, com o rótulo do campo', () => {
    const error = new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Texto do servidor que não deve aparecer.',
      details: [
        { field: 'email', code: 'INVALID_EMAIL' },
        { field: 'plate', code: 'REQUIRED' },
      ],
    })

    expect(translateApiError(t, error)).toBe(
      'E-mail: formato de e-mail inválido · Placa: obrigatório',
    )
  })

  it('interpola os parâmetros numéricos da regra', () => {
    const error = new ApiError({
      statusCode: 400,
      details: [
        { field: 'name', code: 'MAX_LENGTH', params: { max: 100 } },
        { field: 'parkingSpace', code: 'MIN_VALUE', params: { min: 0 } },
      ],
    })

    expect(translateApiError(t, error)).toBe(
      'Nome: máximo de 100 caracteres · Vagas: valor mínimo: 0',
    )
  })

  it('limita a quantidade de itens exibidos', () => {
    const error = new ApiError({
      statusCode: 400,
      details: ['name', 'email', 'plate', 'model', 'color'].map((field) => ({
        field,
        code: 'REQUIRED',
      })),
    })

    expect(translateApiError(t, error)).toBe(
      'Nome: obrigatório · E-mail: obrigatório · Placa: obrigatório · +2 outros campos',
    )
  })

  it('campo fora do mapa usa o nome técnico da propriedade', () => {
    const error = new ApiError({
      statusCode: 400,
      details: [{ field: 'idempotencyKey', code: 'REQUIRED' }],
    })

    expect(translateApiError(t, error)).toBe('idempotencyKey: obrigatório')
  })

  it('código de regra desconhecido cai no genérico, nunca em chave crua', () => {
    const error = new ApiError({
      statusCode: 400,
      details: [{ field: 'name', code: 'REGRA_NOVA' }],
    })

    expect(translateApiError(t, error)).toBe('Nome: valor inválido')
  })

  it('mostra colunas da planilha (obrigatória e desconhecida)', () => {
    const error = new ApiError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Colunas obrigatórias ausentes na planilha: vehiclePlate, userEmail.',
      details: [
        { field: 'vehiclePlate', code: 'REQUIRED' },
        { field: 'userEmail', code: 'REQUIRED' },
        { field: 'setor', code: 'UNKNOWN_COLUMN' },
      ],
    })

    expect(translateApiError(t, error)).toBe(
      'Placa do veículo: obrigatório · E-mail do usuário: obrigatório · setor: coluna desconhecida',
    )
  })

  it('sem details mantém o genérico de validação traduzido', () => {
    const error = new ApiError({ statusCode: 400, message: 'Erro de validação' })

    expect(translateApiError(t, error)).toBe('Erro de validação')
  })

  it('erro que não é de validação continua saindo do código do servidor', () => {
    const error = new ApiError({ code: 'VEICULO_NAO_ENCONTRADO', statusCode: 404 })

    expect(translateApiError(t, error)).toBe('Veículo não encontrado.')
    expect(translateApiError(t, new Error('boom'))).toBe('Ocorreu um erro inesperado')
  })

  it('traduz no idioma ativo', () => {
    const english = i18n.getFixedT('en', 'common')
    const error = new ApiError({
      statusCode: 400,
      details: [{ field: 'email', code: 'REQUIRED' }],
    })

    expect(translateApiError(english, error)).toBe('E-mail: required')
  })
})

// ---------------------------------------------------------------------------
// regras de validação no i18n
// ---------------------------------------------------------------------------
describe('regras de validação', () => {
  it('todo código de regra do backend tem texto nos três idiomas', () => {
    for (const code of VALIDATION_RULE_CODES) {
      for (const lng of ['pt', 'en', 'es']) {
        expect(i18n.exists(`errors.validation.${code}`, { lng })).toBe(true)
      }
    }
  })
})
