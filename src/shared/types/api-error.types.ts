export interface ApiErrorPayload {
  message?: string
  error?: string
  statusCode?: number
  code?: string
  [field: string]: unknown
}
