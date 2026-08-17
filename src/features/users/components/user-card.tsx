// Icons
import { Crown, Eye, Pencil, Trash2, UserRound } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { UserDeleteTarget, UserEntity } from '../types/users.types'

// Components
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
} from '#/shared/components'

// Libs
import { cn } from '#/shared/lib/utils'
import { getInitials } from '#/shared/utils/get-initials'

export type UserCardProps = {
  user: UserEntity
  onEdit: (user: UserEntity) => void
  onDelete: (target: UserDeleteTarget) => void
  /** Se o ator tem `MANAGE_USERS`. */
  canManage: boolean
  /** Se o ator tem cargo is_admin (pode gerenciar administradores). */
  isAdminActor: boolean
  /** Id do usuário logado — evita auto-desativação. */
  currentUserId?: string
}

/**
 * Card de exibição de um usuário.
 *
 * Mostra avatar (foto ou iniciais), nome, e-mail, badges de tipo (colaborador/
 * visitante), status, cargo e de administração (âmbar). Cargo `is_admin` é
 * somente leitura para não-admin (olho em vez de lápis; sem excluir).
 * Também impede excluir a si mesmo.
 */
export function UserCard({
  user,
  onEdit,
  onDelete,
  canManage,
  isAdminActor,
  currentUserId,
}: UserCardProps) {
  const { t } = useTranslation('users')

  const isInactive = !user.isActive
  const isAdminTarget = user.role?.isAdmin ?? false
  const isReadOnly = isAdminTarget && !isAdminActor
  const isSelf = user.id === currentUserId
  const showDelete = canManage && !isSelf && !isReadOnly

  return (
    <Card
      className={cn(
        'bg-card hover:border-primary/50 relative h-full border py-4 transition-all hover:shadow-lg',
        isInactive && 'border-muted hover:border-muted-foreground/50',
      )}
    >
      <CardContent className="space-y-3 px-5">
        {/* Linha superior: avatar + info + ações */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar size="lg" className="shrink-0">
              {user.photoUrl ? <AvatarImage src={user.photoUrl} alt={user.name} /> : null}
              <AvatarFallback
                className={cn(
                  'bg-primary/10 text-primary text-sm font-semibold',
                  isInactive && 'bg-muted text-muted-foreground',
                )}
              >
                {user.name ? getInitials(user.name) : <UserRound className="size-4" />}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate text-base font-semibold">{user.name}</div>
              <div className="text-muted-foreground truncate text-xs">{user.email}</div>

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

                <Badge className="shrink-0 px-2 text-xs" variant="outline">
                  {t(`types.${user.type}`)}
                </Badge>

                {user.role ? (
                  <Badge
                    className={cn(
                      'shrink-0 px-2 text-xs',
                      isAdminTarget && 'border-amber-500 bg-amber-500/10 text-amber-700',
                    )}
                    variant="outline"
                  >
                    {isAdminTarget ? <Crown className="mr-1 size-3" /> : null}
                    {user.role.roleName}
                  </Badge>
                ) : (
                  <Badge
                    className="bg-muted text-muted-foreground shrink-0 px-2 text-xs"
                    variant="outline"
                  >
                    {t('card.no-role')}
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
                onEdit(user)
              }}
              aria-label={isReadOnly ? t('toolbar.view') : t('toolbar.edit')}
            >
              {isReadOnly ? <Eye className="size-4" /> : <Pencil className="size-4" />}
            </Button>

            {showDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive size-8"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete({ id: user.id, name: user.name })
                }}
                aria-label={t('toolbar.delete')}
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
