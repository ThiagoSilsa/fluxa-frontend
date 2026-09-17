/**
 * Uma violação de validação no formato que o backend devolve em `details`
 * (ADR 0016 §4): o campo, o código da regra e o que o texto precisa.
 */
export interface ValidationDetail {
  /** Caminho pontuado da propriedade (`payload.driver.email`). */
  field: string
  /** Código da regra de superfície (`REQUIRED`, `MAX_LENGTH`, …). */
  code: string
  /** O que o texto da regra precisa para ficar completo (`{ max: 100 }`). */
  params?: Record<string, string | number | string[]>
}

export interface ApiErrorPayload {
  message?: string
  error?: string
  statusCode?: number
  code?: string
  /** Violações de validação (erro 400 do `class-validator`). */
  details?: ValidationDetail[]
  [field: string]: unknown
}
