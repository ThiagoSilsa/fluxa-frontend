// Enum
import { apiErrorKeyMap } from '../enum/api-error-key'

// Types
import type { ApiErrorPayload, ValidationDetail } from '../types/api-error.types'

/**
 * Tradução de uma chave — o suficiente do `t` do i18next para montar o texto
 * aqui sem esta camada passar a depender do react-i18next (AGENTS.md §6).
 */
export type TranslateFn = (
  key: string,
  options?: Record<string, string | number | string[]>,
) => string

/**
 * Códigos de regra de validação que o backend envia (ADR 0016 §4) — os mesmos
 * dez de `ValidationRule` no `fluxa-backend`, mais `UNKNOWN_COLUMN`, que a
 * validação de estrutura da planilha declara. Código fora desta lista cai em
 * `errors.validation.unknown`: a tela nunca mostra chave crua.
 */
export const VALIDATION_RULE_CODES = [
  'REQUIRED',
  'MAX_LENGTH',
  'MIN_LENGTH',
  'INVALID_EMAIL',
  'INVALID_FORMAT',
  'MIN_VALUE',
  'MAX_VALUE',
  'INVALID_TYPE',
  'INVALID_VALUE',
  'INVALID_DATE',
  'UNKNOWN_COLUMN',
] as const

/**
 * Teto de violações no toast agregado: um formulário com muitos campos errados
 * estouraria a largura do toast, então as demais viram uma contagem.
 */
export const MAX_VALIDATION_ITEMS = 3

/**
 * Classe de erro personalizada para erros de API. Ela estende a classe nativa Error do JavaScript e inclui propriedades adicionais para fornecer mais contexto sobre o erro, como um código de erro, status HTTP e uma carga útil detalhada.
 * O construtor aceita um objeto de carga útil opcional, que pode conter informações como a mensagem de erro, código de erro, status HTTP e outros detalhes relevantes. Se a mensagem não for fornecida, ele usará uma mensagem de fallback padrão.
 * A classe também inclui métodos auxiliares para verificar se um valor é uma instância de ApiError e para traduzir códigos de erro em chaves de tradução para mensagens de erro amigáveis ao usuário.
 */
export class ApiError extends Error {
  code?: string
  statusCode?: number
  error?: string
  payload?: ApiErrorPayload

  constructor(payload?: ApiErrorPayload, fallbackMessage = 'Erro na requisicao') {
    super(payload?.message || fallbackMessage)
    this.name = 'ApiError'
    this.code = payload?.code
    this.statusCode = payload?.statusCode
    this.error = payload?.error
    this.payload = payload
  }
}
/**
 * Função de tipo guarda para verificar se um valor é uma instância de ApiError. Isso é útil para garantir que estamos lidando com um erro específico da API e não com outros tipos de erros ou objetos.
 * @param value O valor a ser verificado.
 * @returns Retorna true se o valor for uma instância de ApiError, caso contrário, retorna false.
 */
export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError
}

/**
 * Função para traduzir um código de erro de API em uma chave de tradução. Ela verifica se o código de erro existe no mapa de chaves de erro da API e retorna a chave correspondente. Se o código não for encontrado, retorna uma chave genérica para erros.
 *
 * O código vem **do servidor** (`payload.code`, derivado da mensagem pelo
 * `HttpErrorCodeFilter` do backend) e tem chave própria em
 * `errors.server.<CODIGO>`; sem texto para aquele código, cai no genérico — o
 * cliente não deriva código de texto (ADR 0001 §3). Erro de validação do
 * `class-validator` chega como **lista de mensagens e sem `code`** com HTTP 400
 * — esse caso tem chave própria (antes caía no "erro inesperado").
 *
 * @param payload A carga útil do erro, que pode conter um código de erro.
 * @returns A chave de tradução correspondente ao código de erro ou uma chave genérica se o código não for encontrado.
 */
export function translateApiCodeError(payload?: ApiErrorPayload | null) {
  const code = payload?.code
  const key = code ? apiErrorKeyMap[code] : undefined
  if (key) {
    return key
  }

  if (payload?.statusCode === 400) {
    return 'errors.validation.generic'
  }

  return 'errors.generic'
}

/**
 * Função para obter a chave de tradução de um erro. Ela verifica se o erro é uma instância de ApiError e, em caso afirmativo, traduz o código de erro usando a função translateApiCodeError. Se o erro não for um ApiError, retorna uma chave genérica para erros.
 * @param error O erro a ser traduzido.
 * @returns A chave de tradução correspondente ao erro ou uma chave genérica se o erro não for um ApiError.
 */
export function getAPIErrorTranslationKey(error: unknown) {
  if (isApiError(error)) {
    return translateApiCodeError(error.payload)
  }

  return 'errors.generic'
}

/**
 * Uma violação pronta para virar texto.
 */
export interface ValidationItem {
  /** Chave i18n do rótulo do campo (`fields.<propriedade>`). */
  fieldLabelKey: string
  /**
   * Nome técnico da propriedade — reserva do rótulo, usada pelo `defaultValue`
   * do i18next quando o campo não está no mapa (ADR 0001 §4).
   */
  field: string
  /** Chave i18n do texto da regra (`errors.validation.<CODIGO>`). */
  ruleKey: string
  /** O que o texto da regra precisa (`{ max: 100 }`). */
  params: Record<string, string | number | string[]>
}

/**
 * Nome da propriedade a partir do caminho pontuado que o backend envia.
 *
 * DTO aninhado chega como `payload.driver.email`: o rótulo é o do **campo**, não
 * o do objeto que o contém.
 *
 * @param field Caminho pontuado da violação.
 * @returns O último segmento do caminho.
 */
export function fieldNameOf(field: string): string {
  const segments = field.split('.')

  return segments[segments.length - 1] ?? field
}

/**
 * Lê as violações de validação da resposta, tolerando o formato antigo.
 *
 * Resposta sem `details` (ou com `details` vazio) devolve lista vazia — é o que
 * mantém o comportamento anterior para os erros 400 que não são de validação de
 * DTO.
 *
 * @param payload Carga útil do erro.
 * @returns As violações, na ordem em que o servidor as mandou.
 */
export function readValidationItems(payload?: ApiErrorPayload | null): ValidationItem[] {
  const details = payload?.details

  if (!Array.isArray(details)) {
    return []
  }

  return details.map((detail: ValidationDetail) => ({
    fieldLabelKey: `fields.${fieldNameOf(detail.field)}`,
    field: fieldNameOf(detail.field),
    ruleKey: (VALIDATION_RULE_CODES as readonly string[]).includes(detail.code)
      ? `errors.validation.${detail.code}`
      : 'errors.validation.unknown',
    params: detail.params ?? {},
  }))
}

/**
 * Monta o texto do toast agregado: `Campo: regra · Campo: regra`.
 *
 * O rótulo do campo sai do mapa central (`fields.<propriedade>`) e, sem entrada
 * nele, do nome técnico da propriedade (`defaultValue` do i18next). Passando do
 * teto, o resto vira uma contagem — um toast com dez violações não cabe na
 * tela (ADR 0001 §4).
 *
 * @param t Tradução do **conjunto comum** (onde vivem `errors.*` e `fields.*`).
 * @param items Violações lidas da resposta.
 * @returns O texto pronto para o toast.
 */
export function formatValidationItems(t: TranslateFn, items: ValidationItem[]): string {
  const shown = items.slice(0, MAX_VALIDATION_ITEMS)
  const parts = shown.map((item) => {
    const label = t(item.fieldLabelKey, { defaultValue: item.field })

    return `${label}: ${t(item.ruleKey, item.params)}`
  })

  const remaining = items.length - shown.length
  if (remaining > 0) {
    parts.push(t('errors.validation.more', { count: remaining }))
  }

  return parts.join(' · ')
}

/**
 * Texto do erro de API para exibir ao usuário.
 *
 * Erro de validação com `details` vira o texto agregado (o todo do ADR 0001 §4);
 * os demais casos continuam sendo a tradução do código do servidor, no idioma
 * ativo. Esta é a função que as telas usam no `onError` das mutations.
 *
 * @param t Tradução do **conjunto comum** (`useTranslation('common')`).
 * @param error Erro capturado da mutation.
 * @returns O texto pronto para o toast.
 */
export function translateApiError(t: TranslateFn, error: unknown): string {
  const payload = isApiError(error) ? error.payload : undefined
  const items = readValidationItems(payload)

  if (items.length > 0) {
    return formatValidationItems(t, items)
  }

  return t(getAPIErrorTranslationKey(error))
}
