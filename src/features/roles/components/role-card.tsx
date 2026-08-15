// Icons
import { Crown, Eye, Pencil, ShieldCheck, Trash2, UserRound } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { RoleCardProps } from '../types/roles.types'

// Components
import { Badge, Button, Card, CardContent } from '#/shared/components'

// Libs
import { cn } from '#/shared/lib/utils'

/**
 * Card de exibição de um cargo.
 *
 * Mostra ícone (coroa para cargo do sistema), nome, descrição, badges de
 * status e de cargo do sistema, e ações: editar/ver, gerenciar permissões e
 * desativar. Cargo do sistema (`isAdmin`) é somente leitura: sem editar nem
 * desativar. Sem contagem de permissões no card (evita N+1 — o vínculo vive
 * no dialog de permissões).
 */
export function RoleCard({
  role,
  onEdit,
  onDelete,
  onManagePermissions,
  canManage,
}: RoleCardProps) {
  const { t } = useTranslation('roles')

  const isInactive = !role.isActive
  const isReadOnly = role.isAdmin || !canManage
  const Icon = role.isAdmin ? Crown : UserRound

  return (
    <Card
      className={cn(
        'bg-card hover:border-primary/50 relative h-full border py-4 transition-all hover:shadow-lg',
        isInactive && 'border-muted hover:border-muted-foreground/50',
      )}
    >
      <CardContent className="space-y-3 px-5">
        {/* Linha superior: ícone + info + ações */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                isInactive ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
                role.isAdmin && 'border border-amber-500 bg-amber-500/10 text-amber-700',
              )}
            >
              <Icon className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate text-base font-semibold">{role.name}</div>
              {role.description && (
                <div className="text-muted-foreground truncate text-xs">{role.description}</div>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-1">
                <Badge
                  className={cn(
                    'shrink-0 px-2 text-xs',
                    isInactive
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary/10 text-primary border-primary',
                  )}
                  variant="outline"
                >
                  {isInactive ? t('status.inactive') : t('status.active')}
                </Badge>

                {role.isAdmin && (
                  <Badge
                    className="shrink-0 border-amber-500 bg-amber-500/10 px-2 text-xs text-amber-700"
                    variant="outline"
                  >
                    {t('card.system_role')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(event) => {
                event.stopPropagation()
                onEdit(role)
              }}
              aria-label={isReadOnly ? t('toolbar.view') : t('toolbar.edit')}
            >
              {isReadOnly ? <Eye className="size-4" /> : <Pencil className="size-4" />}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(event) => {
                event.stopPropagation()
                onManagePermissions(role)
              }}
              aria-label={t('toolbar.managePermissions')}
            >
              <ShieldCheck className="size-4" />
            </Button>

            {!role.isAdmin && canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive size-8"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete({ id: role.id, name: role.name })
                }}
                aria-label={t('toolbar.deactivate')}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
