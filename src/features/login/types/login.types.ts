/**
 * Tipos do desfecho do login.
 *
 * O login tem dois desfechos possíveis (contrato do backend `fluxa-backend`):
 * - `LoginSessionResponse`: senha confere para uma empresa → sessão (token + pessoa);
 * - `LoginCompanyChoiceResponse`: senha confere para mais de uma empresa → escolha.
 */

/** Pessoa devolvida pela rota de login (identidade básica). */
export interface LoginUserInfo {
  id: string
  name: string
  email: string
  /** Tipo da pessoa (`EMPLOYEE` | `VISITOR`). */
  type?: string
}

/** Desfecho de sessão: token de acesso + identidade da pessoa. */
export interface LoginSessionResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: LoginUserInfo
}

/** Empresa disponível na escolha de empresa (multi-empresa). */
export interface LoginCompanyChoice {
  id: string
  name: string
}

/** Desfecho de escolha de empresa: a senha vale para mais de uma empresa. */
export interface LoginCompanyChoiceResponse {
  requiresCompanyChoice: true
  companies: LoginCompanyChoice[]
}

export type LoginResponse = LoginSessionResponse | LoginCompanyChoiceResponse

/** Credenciais enviadas ao `POST /auth/login` (a empresa é opcional). */
export interface LoginCredentials {
  email: string
  password: string
  companyId?: string
}

/**
 * Distingue o desfecho de sessão do de escolha de empresa.
 *
 * @param response Resposta do login.
 * @returns `true` quando é uma sessão (`LoginSessionResponse`).
 */
export function isLoginSession(response: LoginResponse): response is LoginSessionResponse {
  return !('requiresCompanyChoice' in response)
}
