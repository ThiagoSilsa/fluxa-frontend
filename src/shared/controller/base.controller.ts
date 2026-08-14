// Lib
import { ApiError } from '../lib/api-error'
import { getAuthToken } from '../lib/auth-storage'
import { redirectToLogin } from '../lib/redirect-to-login'

// Types
import type { BaseControllerObject } from '../schemas/base-controller.schema'
import type { ApiErrorPayload } from '../types/api-error.types'

export class BaseController {
  async makeRequest({
    endpoint,
    method = 'GET',
    body,
    headers = {},
    isPublic = false,
    isFormData = false,
    responseType = 'auto',
  }: BaseControllerObject) {
    if (!isPublic) {
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const contentTypeHeader: Record<string, string> = isFormData
      ? {}
      : { 'Content-Type': 'application/json' }

    const options: RequestInit = {
      method: method,
      headers: {
        ...contentTypeHeader,
        ...headers,
      },
    }

    if (body) {
      options.body = isFormData ? (body as FormData) : JSON.stringify(body)
    }

    const baseUrl = import.meta.env.VITE_API_URL
    const endpointUrl = `${baseUrl}${endpoint}`

    const response = await fetch(endpointUrl, options)
    const contentType = response.headers.get('content-type') || ''

    if (!response.ok) {
      let errorData: ApiErrorPayload = {}

      if (contentType.includes('application/json')) {
        errorData = (await response.json()) as ApiErrorPayload
      } else {
        const text = await response.text()
        errorData = { message: text.slice(0, 200) }
      }

      // Se o token expirou (401), redireciona para o login
      if (response.status === 401) {
        redirectToLogin()
      }

      throw new ApiError(
        {
          ...errorData,
          statusCode: response.status,
        },
        'Erro na requisicao',
      )
    }

    if (responseType === 'blob') {
      return response.blob()
    }

    if (contentType.includes('application/json')) {
      return response.json()
    }

    return response.text()
  }
}
export default new BaseController()
