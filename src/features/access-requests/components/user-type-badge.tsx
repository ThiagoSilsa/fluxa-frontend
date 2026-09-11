// i18n
import { useTranslation } from 'react-i18next'

// Lib
import { getAccessRequestUserTypeLabelKey } from '../lib/access-request.lib'

// Types
import type { AccessRequestUserType } from '../types/access-requests.types'

// Shared
import { Badge } from '#/shared/components'

/** Cores do badge conforme o tipo de usuário do motorista. */
const USER_TYPE_CLASS: Record<AccessRequestUserType, string> = {
  EMPLOYEE: 'border-blue-300 bg-blue-100 text-blue-800',
  VISITOR: 'border-slate-300 bg-slate-100 text-slate-700',
}

/**
 * Badge do tipo de usuário do motorista a criar (Colaborador/Visitante —
 * ADR 0013).
 *
 * Exibido apenas nas solicitações que criam motorista (`NEW_USER`/`BOTH`).
 */
export function AccessRequestUserTypeBadge({ userType }: { userType: AccessRequestUserType }) {
  const { t } = useTranslation('accessRequests')

  return (
    <Badge variant="outline" className={USER_TYPE_CLASS[userType]}>
      {t(getAccessRequestUserTypeLabelKey(userType))}
    </Badge>
  )
}
