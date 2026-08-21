// i18n
import { useTranslation } from 'react-i18next'

// Mappers
import { normalizeUserFormDefaults } from '../mappers/user.mapper'

// Components
import { UserForm } from './user-form'

// Types
import type { UserFormValues } from '../schemas/user.schema'
import type { UserEntity, UserRoleOption } from '../types/users.types'

// Components
import { FormDialog } from '#/shared/components'

export type UserFormDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Modo do formulário: criação ou edição. */
  mode: 'create' | 'edit'
  /** Usuário em edição (modo edição). */
  user?: UserEntity
  /** Se true, desabilita o submit enquanto a ação está pendente. */
  isSubmitting: boolean
  /** Rótulo do botão de submit (a não ser no modo vincular). */
  submitLabel: string
  /** Se o ator pode atribuir cargos de administração. */
  canManageAdmin: boolean
  /** Catálogo de cargos ativos para o Select. */
  roleOptions: UserRoleOption[]
  /** Callback de submit com os valores validados. */
  onSubmit: (values: UserFormValues, isLink: boolean) => void
}

/**
 * Dialog de formulário de usuário (criação/vínculo/edição).
 *
 * Compõe o `FormDialog` (2xl, altura fixa) com o `UserForm`. Alvo com cargo
 * `is_admin` abre somente leitura para ator não-admin (governança).
 */
export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  isSubmitting,
  submitLabel,
  canManageAdmin,
  roleOptions,
  onSubmit,
}: UserFormDialogProps) {
  const { t } = useTranslation('users')

  const isAdminTarget = user?.role?.isAdmin ?? false
  const readOnly = mode === 'edit' && isAdminTarget && !canManageAdmin

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('dialog.create.title') : t('dialog.edit.title')}
      description={
        mode === 'create' ? t('dialog.create.description') : t('dialog.edit.description')
      }
      size="2xl"
      fixedHeight
    >
      <UserForm
        defaultValues={normalizeUserFormDefaults(user)}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        readOnly={readOnly}
        mode={mode}
        roleOptions={roleOptions}
        canManageAdmin={canManageAdmin}
        isAdminTarget={isAdminTarget}
      />
    </FormDialog>
  )
}
