// Icons
import { Building2, Eye, Pencil, Trash2 } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { DepartmentCardProps } from '../types/departments.types'

// Components
import { Badge, Button, Card, CardContent } from '#/shared/components'

// Libs
import { cn } from '#/shared/lib/utils'

/**
 * Card de exibição de um departamento.
 *
 * Mostra ícone, nome, descrição (se houver) e badges de status
 * (ativo/inativo) e de vagas de estacionamento. Ações: editar e excluir
 * (exclusão física — 409 se houver veículos vinculados ao departamento).
 */
export function DepartmentCard({ department, onEdit, onDelete, canManage }: DepartmentCardProps) {
  const { t } = useTranslation('departments')

  const isInactive = !department.isActive
  const isReadOnly = !canManage

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
              )}
            >
              <Building2 className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-foreground flex items-center gap-2">
                <span className="truncate text-base font-semibold">{department.name}</span>
              </div>
              {department.description && (
                <div className="text-muted-foreground truncate text-xs">
                  {department.description}
                </div>
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

                <Badge
                  className="shrink-0 px-2 text-xs"
                  variant="outline"
                  aria-label={t('card.vagas')}
                >
                  {t('card.vagas-count', { count: department.parkingSpace })}
                </Badge>
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
                onEdit(department)
              }}
              aria-label={isReadOnly ? t('toolbar.view') : t('toolbar.edit')}
            >
              {isReadOnly ? <Eye className="size-4" /> : <Pencil className="size-4" />}
            </Button>

            {canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:bg-destructive/10 hover:text-destructive size-8"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete({ id: department.id, name: department.name })
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
