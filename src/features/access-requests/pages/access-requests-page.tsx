// React
import { useMemo, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GoPlus } from 'react-icons/go'

// Mappers
import { toCreateAccessRequestPayload } from '../mappers/access-request.mapper'

// Lib
import { getAccessRequestTypeLabelKey } from '../lib/access-request.lib'

// Hooks
import { useAccessRequestMutations } from '../hooks/use-access-request-mutations'
import { useAccessRequestsQuery } from '../hooks/use-access-requests-query'

// Components
import { AccessRequestCreateDialog } from '../components/access-request-create-dialog'
import { AccessRequestDetailDialog } from '../components/access-request-detail-dialog'
import { AccessRequestStatusBadge } from '../components/status-badge'

// Types
import type {
  AcceptAccessRequestPayload,
  AccessRequestResponse,
  AccessRequestStatus,
} from '../types/access-requests.types'
import type { AccessRequestFormValues } from '../schemas/access-request.schema'

// Shared
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'
import { canAccess } from '#/shared/lib/auth-access'
import { PermissionCode } from '#/shared/enum/permission-code'
import {
  Button,
  Header,
  Input,
  PageLayout,
  PagePlaceholder,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '#/shared/components'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

const PAGE_SIZE = 20

const STATUS_FILTERS: Array<{ value: AccessRequestStatus | 'all'; label: string }> = [
  { value: 'all', label: 'all' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'IN_CONTACT', label: 'IN_CONTACT' },
  { value: 'REGISTERED', label: 'REGISTERED' },
  { value: 'REJECTED', label: 'REJECTED' },
  { value: 'CANCELLED', label: 'CANCELLED' },
]

/**
 * Página de solicitações de acesso (ADR 0010 M5 — Fase 3).
 *
 * Lista com filtro por status e busca por placa, criação dos 4 cenários
 * (porteiro) e avaliação (aceitar/rejeitar/em contato/cancelar) — rotas
 * protegidas por `MANAGE_ACCESS_REQUESTS` (lista/avaliação) e
 * `CREATE_ACCESS_REQUEST` (criação).
 */
export function AccessRequestsPage() {
  const { t } = useTranslation('accessRequests')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()

  const canList = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.MANAGE_ACCESS_REQUESTS] }),
    [user],
  )
  const canCreate = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.CREATE_ACCESS_REQUEST] }),
    [user],
  )
  const canCancel = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.CANCEL_ACCESS_REQUEST] }),
    [user],
  )

  const [status, setStatus] = useState<AccessRequestStatus | 'all'>('all')
  const [plateInput, setPlateInput] = useState('')
  const debouncedPlate = useDebouncedValue(plateInput, 400)
  const [offset, setOffset] = useState(0)

  const [createOpen, setCreateOpen] = useState(false)
  const [detail, setDetail] = useState<AccessRequestResponse | null>(null)

  const { data, isPending } = useAccessRequestsQuery({
    status: status === 'all' ? undefined : status,
    plate: debouncedPlate.trim() || undefined,
    limit: PAGE_SIZE,
    offset,
  })

  const { create, accept, reject, markInContact, cancel } = useAccessRequestMutations()

  if (!canList && !canCreate) {
    return (
      <PageLayout>
        <PagePlaceholder title={tc('no-access.title')} />
      </PageLayout>
    )
  }

  const isAnyPending =
    create.isPending ||
    accept.isPending ||
    reject.isPending ||
    markInContact.isPending ||
    cancel.isPending

  const handleCreate = (values: AccessRequestFormValues) => {
    create.mutate(toCreateAccessRequestPayload(values), {
      onSuccess: () => setCreateOpen(false),
    })
  }

  const handleAccept = (payload: AcceptAccessRequestPayload) => {
    if (!detail) {
      return
    }
    accept.mutate({ id: detail.id, payload }, { onSuccess: () => setDetail(null) })
  }

  const handleReject = () => {
    if (!detail) {
      return
    }
    reject.mutate({ id: detail.id }, { onSuccess: () => setDetail(null) })
  }

  const handleMarkInContact = () => {
    if (!detail) {
      return
    }
    markInContact.mutate(detail.id, { onSuccess: () => setDetail(null) })
  }

  const handleCancel = () => {
    if (!detail) {
      return
    }
    cancel.mutate(detail.id, { onSuccess: () => setDetail(null) })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  return (
    <PageLayout>
      <Header title={t('title')} subtitle={t('subtitle')}>
        {canCreate ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <GoPlus className="mr-2 size-4" />
            {t('toolbar.create')}
          </Button>
        ) : null}
      </Header>

      {canList ? (
        <>
          {/* Filtros */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="w-full sm:w-48">
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as AccessRequestStatus | 'all')
                  setOffset(0)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.status.label')} />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.value === 'all'
                        ? t('filters.status.all')
                        : t(`status.${filter.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              value={plateInput}
              onChange={(event) => {
                setPlateInput(event.target.value)
                setOffset(0)
              }}
              placeholder={t('filters.search.placeholder')}
              className="w-full uppercase sm:max-w-xs"
            />
          </div>

          {/* Lista */}
          {isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : null}

          {!isPending && data && data.data.length === 0 ? (
            <div className="space-y-1">
              <p className="font-medium">{t('empty.title')}</p>
              <p className="text-muted-foreground text-sm">{t('empty.description')}</p>
            </div>
          ) : null}

          {!isPending && data && data.data.length > 0 ? (
            <div className="divide-y rounded-md border">
              {data.data.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="font-medium uppercase">{request.plate}</span>
                    <span className="text-muted-foreground text-sm">
                      {t(getAccessRequestTypeLabelKey(request.type))}
                    </span>
                    <AccessRequestStatusBadge status={request.status} />
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-muted-foreground text-sm">
                      {request.requestedBy.name}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDetail(request)}
                    >
                      {t('actions.view')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Paginação */}
          {data && data.count > 0 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {data.count} · página {currentPage}/{totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={offset === 0}
                  onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setOffset((value) => value + PAGE_SIZE)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
      )}

      <AccessRequestCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isSubmitting={create.isPending}
        onSubmit={handleCreate}
      />

      <AccessRequestDetailDialog
        open={detail !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDetail(null)
          }
        }}
        request={detail}
        canManage={canList}
        canCancel={canCancel}
        isPending={isAnyPending}
        onAccept={handleAccept}
        onReject={handleReject}
        onMarkInContact={handleMarkInContact}
        onCancel={handleCancel}
      />
    </PageLayout>
  )
}
