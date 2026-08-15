// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useRolePermissions } from '../hooks/use-role-permissions'

// Types
import type { RolePermissionsDialogProps } from '../types/roles.types'

// Components
import { Checkbox, FormDialog, Skeleton } from '#/shared/components'

// Libs
import { cn } from '#/shared/lib/utils'
import { translatePermissionLabel } from '#/shared/lib/translate-permission'

/**
 * Dialog de gerenciamento de permissões de um cargo.
 *
 * Lista o catálogo (`available`) com checkbox marcado conforme o vínculo atual
 * (`assignedIds`); o toggle alterna individualmente via POST/DELETE (sem
 * substituição em lote). Cargo do sistema (`isAdmin`) abre somente leitura.
 */
export function RolePermissionsDialog({ role, onOpenChange }: RolePermissionsDialogProps) {
  const { t } = useTranslation('roles')

  const readOnly = role?.isAdmin ?? false
  const { available, isLoading, assignedIds, pendingPermissionId, handleToggle } =
    useRolePermissions(role?.id ?? null)

  return (
    <FormDialog
      open={!!role}
      onOpenChange={onOpenChange}
      title={t('dialog.permissions.title')}
      description={t('dialog.permissions.description', { role: role?.name ?? '' })}
      size="2xl"
    >
      {isLoading ? (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : available.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t('permissionsDialog.empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {available.map((permission) => {
            const isAssigned = assignedIds.has(permission.id)
            const isPending = pendingPermissionId === permission.id

            return (
              <label
                key={permission.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                  isAssigned ? 'border-primary bg-primary/5' : 'border-input hover:bg-muted/50',
                  readOnly && 'pointer-events-none opacity-60',
                )}
              >
                <Checkbox
                  checked={isAssigned}
                  disabled={isPending || readOnly}
                  onCheckedChange={() => void handleToggle(permission)}
                  className="mt-0.5"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {translatePermissionLabel(permission.code)}
                  </div>
                  {permission.description ? (
                    <div className="text-muted-foreground text-xs">{permission.description}</div>
                  ) : null}
                </div>
              </label>
            )
          })}
        </div>
      )}
    </FormDialog>
  )
}
