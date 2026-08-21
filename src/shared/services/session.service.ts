// Controller
import baseController from '#/shared/controller/base.controller'

// Types
import type { AuthSession, AuthUser } from '#/shared/types/auth.types'

/** Resposta de `GET /auth/validate` (contrato do backend). */
interface ValidateSessionResponse {
  id: string
  companyId: string
  email: string
  name: string
  type?: string
  roleCodes: string[]
  permissions: string[]
  /** Se a pessoa tem cargo `is_admin` ativo na empresa da sessão. */
  isAdmin: boolean
}

/**
 * Enriquece a sessão com cargo, permissões e a empresa confirmada.
 *
 * O login devolve só a identidade básica. `roleCodes` e `permissionCodes` vêm
 * de `GET /auth/validate` — o backend revalida o vínculo pessoa + empresa a
 * cada requisição, então esta leitura também confirma a sessão.
 *
 * @param session Sessão básica (token + pessoa) retornada pelo login.
 * @returns Sessão com `roleCodes`, `permissionCodes` e `companyId` confirmados.
 */
export async function buildUserSession(session: AuthSession): Promise<AuthSession> {
  const details = (await baseController.makeRequest({
    endpoint: '/auth/validate',
    method: 'GET',
  })) as ValidateSessionResponse

  const user: AuthUser = {
    ...session.user,
    companyId: details.companyId,
    roleCodes: details.roleCodes,
    permissionCodes: details.permissions,
    type: details.type,
    isAdmin: details.isAdmin,
  }

  return {
    accessToken: session.accessToken,
    user,
  }
}
