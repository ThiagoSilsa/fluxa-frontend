// Enum
import { apiErrorKeyMap } from '../enum/api-error-key'

// Types
import type { ApiErrorPayload } from '../types/api-error.types'

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
 * @param payload A carga útil do erro, que pode conter um código de erro.
 * @returns A chave de tradução correspondente ao código de erro ou uma chave genérica se o código não for encontrado.
 */
export function translateApiCodeError(payload?: ApiErrorPayload | null) {
  const code = payload?.code
  if (!code) {
    return 'errors.generic'
  }

  return apiErrorKeyMap[code] ?? 'errors.generic'
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
