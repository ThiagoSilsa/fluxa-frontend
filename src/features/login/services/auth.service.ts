// Controller
import baseController from '#/shared/controller/base.controller'

// Types
import type { LoginCredentials, LoginResponse } from '../types/login.types'

class AuthService {
  /**
   * Envia as credenciais ao backend.
   *
   * Rota pública (`isPublic`): não envia token. Pode devolver uma sessão ou a
   * escolha de empresa (multi-empresa).
   *
   * @param credentials E-mail, senha e, opcionalmente, a empresa escolhida.
   * @returns `LoginSessionResponse` ou `LoginCompanyChoiceResponse`.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await baseController.makeRequest({
      endpoint: '/auth/login',
      method: 'POST',
      body: credentials,
      isPublic: true,
    })

    return response as LoginResponse
  }
}

export const authService = new AuthService()
