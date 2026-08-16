/**
 * Tipos compartilhados de autenticação.
 *
 * Contrato alinhado ao backend (fluxa-backend):
 * - O JWT carrega `{ sub, companyId, email, iat, exp }`.
 * - O login devolve a identidade da pessoa + token de acesso.
 * - O enriquecimento da sessão vem de `GET /auth/validate` (`roleCodes` e `permissionCodes`).
 */

/** Pessoa autenticada na sessão atual. */
export interface AuthUser {
  /** Identificador da pessoa (claim `sub` do JWT). */
  id: string
  email: string
  name: string
  /** Empresa da sessão (claim `companyId` do JWT). */
  companyId: string
  /** Nome da empresa da sessão — preenchido quando disponível (ex.: troca de empresa). */
  companyName?: string | null
  /** Códigos de cargo, vindos de `GET /auth/validate`. */
  roleCodes?: string[]
  /** Códigos de permissão, vindos de `GET /auth/validate`. */
  permissionCodes?: string[]
  /** Tipo da pessoa (`EMPLOYEE` | `VISITOR`), vindo do login. */
  type?: string
  /**
   * Se a pessoa tem cargo `is_admin` ativo na empresa da sessão (acesso
   * total — governança especial de administradores, ADR 0004/0005). Vindo de
   * `GET /auth/validate`.
   */
  isAdmin?: boolean
}

/** Sessão autenticada: token de acesso + pessoa. */
export interface AuthSession {
  accessToken: string
  user: AuthUser
}

/** Payload do JWT emitido pelo backend. */
export interface AuthTokenPayload {
  sub: string
  companyId: string
  email: string
  iat: number
  exp: number
}

/** Valor exposto pelo `AuthProvider` via `useAuth()`. */
export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isReady: boolean
  login: (session: AuthSession) => void
  logout: () => void
}

/** Empresa da sessão, retornada por `GET /auth/companies` e na escolha de empresa. */
export interface SessionCompany {
  id: string
  name: string
}

/** Requisitos de acesso de uma rota/tela (papel tem precedência sobre permissão). */
export interface AccessRequirements {
  roles?: string[]
  permissions?: string[]
}
