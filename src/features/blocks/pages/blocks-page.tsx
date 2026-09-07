// React
import { useMemo, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Icons
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GoPlus } from 'react-icons/go'

// Mappers
import { toCreateBlockPayload, toRevokeBlockPayload } from '../mappers/block.mapper'

// Lib
import { formatDateTime, getBlockTypeLabelKey } from '../lib/block.lib'

// Hooks
import { useBlockMutations } from '../hooks/use-block-mutations'
import { useBlockRequestsQuery } from '../hooks/use-block-requests-query'
import { useBlocksQuery } from '../hooks/use-blocks-query'

// Components
import { BlockCreateDialog } from '../components/block-create-dialog'
import { BlockRequestStatusBadge } from '../components/block-request-status-badge'
import { BlockRevokeDialog } from '../components/block-revoke-dialog'
import { BlockStatusBadge } from '../components/block-status-badge'

// Types
import type { BlockRequestStatus, BlockResponse, VehicleBlockStatus } from '../types/blocks.types'
import type { BlockFormValues, RevokeBlockValues } from '../schemas/block.schema'

// Shared
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'
import { canAccess } from '#/shared/lib/auth-access'
import { PermissionCode } from '#/shared/enum/permission-code'
import {
  Button,
  ConfirmDialog,
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

const BLOCK_STATUS_FILTERS: Array<{ value: VehicleBlockStatus | 'all' }> = [
  { value: 'all' },
  { value: 'ACTIVE' },
  { value: 'REVOKED' },
]

const REQUEST_STATUS_FILTERS: Array<{ value: BlockRequestStatus | 'all' }> = [
  { value: 'all' },
  { value: 'PENDING' },
  { value: 'APPROVED' },
  { value: 'REJECTED' },
  { value: 'CANCELLED' },
]

type BlocksTab = 'blocks' | 'requests'

/**
 * Página de bloqueios (ADR 0010 M5 — Fase 4).
 *
 * Aba "Bloqueios": listar/criar/revogar `vehicle_block` (MANAGE_BLOCKS).
 * Aba "Solicitações": porteiro cria/cancela `block_request`
 * (CREATE_BLOCK_REQUEST); administração aprova (cria o bloqueio) ou rejeita
 * (MANAGE_BLOCKS).
 */
export function BlocksPage() {
  const { t } = useTranslation('blocks')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()

  const canManageBlocks = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.MANAGE_BLOCKS] }),
    [user],
  )
  const canCreateRequest = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.CREATE_BLOCK_REQUEST] }),
    [user],
  )

  const [tab, setTab] = useState<BlocksTab>('blocks')

  // Filtros de bloqueios
  const [blockSearch, setBlockSearch] = useState('')
  const debouncedSearch = useDebouncedValue(blockSearch, 400)
  const [blockStatus, setBlockStatus] = useState<VehicleBlockStatus | 'all'>('all')
  const [blockOffset, setBlockOffset] = useState(0)

  // Filtros de solicitações
  const [requestStatus, setRequestStatus] = useState<BlockRequestStatus | 'all'>('all')
  const [requestOffset, setRequestOffset] = useState(0)

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [createMode, setCreateMode] = useState<'block' | 'request'>('block')
  const [revokeTarget, setRevokeTarget] = useState<BlockResponse | null>(null)
  const [approveTarget, setApproveTarget] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)

  const { data: blocks, isPending: blocksPending } = useBlocksQuery({
    search: debouncedSearch.trim() || undefined,
    status: blockStatus === 'all' ? undefined : blockStatus,
    limit: PAGE_SIZE,
    offset: blockOffset,
  })

  const { data: requests, isPending: requestsPending } = useBlockRequestsQuery({
    status: requestStatus === 'all' ? undefined : requestStatus,
    limit: PAGE_SIZE,
    offset: requestOffset,
  })

  const { createBlock, revokeBlock, createBlockRequest, approveBlockRequest, rejectBlockRequest } =
    useBlockMutations()

  if (!canManageBlocks && !canCreateRequest) {
    return (
      <PageLayout>
        <PagePlaceholder title={tc('no-access.title')} />
      </PageLayout>
    )
  }

  const isAnyPending =
    createBlock.isPending ||
    revokeBlock.isPending ||
    createBlockRequest.isPending ||
    approveBlockRequest.isPending ||
    rejectBlockRequest.isPending

  const openCreate = (mode: 'block' | 'request') => {
    setCreateMode(mode)
    setCreateOpen(true)
  }

  const handleCreate = (values: BlockFormValues) => {
    const payload = toCreateBlockPayload(values)
    if (createMode === 'block') {
      createBlock.mutate(payload, { onSuccess: () => setCreateOpen(false) })
    } else {
      createBlockRequest.mutate(payload, { onSuccess: () => setCreateOpen(false) })
    }
  }

  const handleRevoke = (values: RevokeBlockValues) => {
    if (!revokeTarget) {
      return
    }
    const id = revokeTarget.id
    revokeBlock.mutate(
      { id, payload: toRevokeBlockPayload(values) },
      { onSuccess: () => setRevokeTarget(null) },
    )
  }

  const handleApprove = () => {
    if (!approveTarget) {
      return
    }
    const id = approveTarget
    approveBlockRequest.mutate(id, { onSuccess: () => setApproveTarget(null) })
  }

  const handleReject = () => {
    if (!rejectTarget) {
      return
    }
    const id = rejectTarget
    rejectBlockRequest.mutate(id, { onSuccess: () => setRejectTarget(null) })
  }

  const blocksTotalPages = blocks ? Math.max(1, Math.ceil(blocks.count / PAGE_SIZE)) : 1
  const blocksCurrentPage = Math.floor(blockOffset / PAGE_SIZE) + 1
  const requestsTotalPages = requests ? Math.max(1, Math.ceil(requests.count / PAGE_SIZE)) : 1
  const requestsCurrentPage = Math.floor(requestOffset / PAGE_SIZE) + 1

  return (
    <PageLayout>
      <Header title={t('title')} subtitle={t('subtitle')} />

      {/* Abas */}
      <div className="flex gap-2">
        {canManageBlocks ? (
          <Button
            type="button"
            variant={tab === 'blocks' ? 'default' : 'outline'}
            onClick={() => setTab('blocks')}
          >
            {t('tabs.blocks')}
          </Button>
        ) : null}
        {canManageBlocks || canCreateRequest ? (
          <Button
            type="button"
            variant={tab === 'requests' ? 'default' : 'outline'}
            onClick={() => setTab('requests')}
          >
            {t('tabs.requests')}
          </Button>
        ) : null}
      </div>

      {tab === 'blocks' && canManageBlocks ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <Select
                value={blockStatus}
                onValueChange={(value) => {
                  setBlockStatus(value as VehicleBlockStatus | 'all')
                  setBlockOffset(0)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_STATUS_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.value === 'all'
                        ? t('filters.status.all')
                        : t(`blockStatus.${filter.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              value={blockSearch}
              onChange={(event) => {
                setBlockSearch(event.target.value)
                setBlockOffset(0)
              }}
              placeholder={t('filters.search.placeholder')}
              className="w-full uppercase sm:max-w-xs"
            />
            <Button type="button" onClick={() => openCreate('block')} className="sm:ml-auto">
              <GoPlus className="mr-2 size-4" />
              {t('toolbar.createBlock')}
            </Button>
          </div>

          {blocksPending ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : null}

          {!blocksPending && blocks && blocks.data.length === 0 ? (
            <div className="space-y-1">
              <p className="font-medium">{t('empty.title')}</p>
              <p className="text-muted-foreground text-sm">{t('empty.description')}</p>
            </div>
          ) : null}

          {!blocksPending && blocks && blocks.data.length > 0 ? (
            <div className="divide-y rounded-md border">
              {blocks.data.map((block) => (
                <div
                  key={block.id}
                  className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="font-medium uppercase">{block.plate}</span>
                    <span className="text-muted-foreground text-sm">
                      {t(getBlockTypeLabelKey(block.blockType))}
                    </span>
                    <BlockStatusBadge status={block.status} />
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-muted-foreground max-w-[260px] truncate text-sm">
                      {block.reason}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {formatDateTime(block.blockedAt)}
                    </span>
                    {block.status === 'ACTIVE' ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRevokeTarget(block)}
                      >
                        {t('actions.revoke')}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {blocks && blocks.count > 0 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {blocks.count} · página {blocksCurrentPage}/{blocksTotalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={blockOffset === 0}
                  onClick={() => setBlockOffset((value) => Math.max(0, value - PAGE_SIZE))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={blocksCurrentPage >= blocksTotalPages}
                  onClick={() => setBlockOffset((value) => value + PAGE_SIZE)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {tab === 'requests' && (canManageBlocks || canCreateRequest) ? (
        <div className="space-y-4">
          {canManageBlocks ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="w-full sm:w-48">
                  <Select
                    value={requestStatus}
                    onValueChange={(value) => {
                      setRequestStatus(value as BlockRequestStatus | 'all')
                      setRequestOffset(0)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUEST_STATUS_FILTERS.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.value === 'all'
                            ? t('filters.status.all')
                            : t(`requestStatus.${filter.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={() => openCreate('request')} className="sm:ml-auto">
                  <GoPlus className="mr-2 size-4" />
                  {t('toolbar.createRequest')}
                </Button>
              </div>

              {requestsPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : null}

              {!requestsPending && requests && requests.data.length === 0 ? (
                <div className="space-y-1">
                  <p className="font-medium">{t('empty.title')}</p>
                  <p className="text-muted-foreground text-sm">{t('empty.description')}</p>
                </div>
              ) : null}

              {!requestsPending && requests && requests.data.length > 0 ? (
                <div className="divide-y rounded-md border">
                  {requests.data.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                        <span className="font-medium uppercase">{request.plate}</span>
                        <span className="text-muted-foreground max-w-[260px] truncate text-sm">
                          {request.reason}
                        </span>
                        <BlockRequestStatusBadge status={request.status} />
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className="text-muted-foreground text-sm">
                          {request.requestedBy.name} · {formatDateTime(request.requestedAt)}
                        </span>
                        {request.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isAnyPending}
                              onClick={() => setApproveTarget(request.id)}
                            >
                              {t('actions.approve')}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={isAnyPending}
                              onClick={() => setRejectTarget(request.id)}
                            >
                              {t('actions.reject')}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {requests && requests.count > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {requests.count} · página {requestsCurrentPage}/{requestsTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={requestOffset === 0}
                      onClick={() => setRequestOffset((value) => Math.max(0, value - PAGE_SIZE))}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={requestsCurrentPage >= requestsTotalPages}
                      onClick={() => setRequestOffset((value) => value + PAGE_SIZE)}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
              <Button type="button" onClick={() => openCreate('request')}>
                <GoPlus className="mr-2 size-4" />
                {t('toolbar.createRequest')}
              </Button>
            </div>
          )}
        </div>
      ) : null}

      <BlockCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode={createMode}
        isSubmitting={createMode === 'block' ? createBlock.isPending : createBlockRequest.isPending}
        onSubmit={handleCreate}
      />

      <BlockRevokeDialog
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRevokeTarget(null)
          }
        }}
        plate={revokeTarget?.plate ?? ''}
        isSubmitting={revokeBlock.isPending}
        onSubmit={handleRevoke}
      />

      <ConfirmDialog
        open={approveTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setApproveTarget(null)
          }
        }}
        title={t('confirm.approve-title')}
        description={t('confirm.approve-description', { plate: '' })}
        confirmLabel={t('confirm.confirm')}
        cancelLabel={t('confirm.cancel')}
        onConfirm={handleApprove}
        isPending={approveBlockRequest.isPending}
        variant="default"
      />

      <ConfirmDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null)
          }
        }}
        title={t('confirm.reject-title')}
        description={t('confirm.reject-description', { plate: '' })}
        confirmLabel={t('confirm.confirm')}
        cancelLabel={t('confirm.cancel')}
        onConfirm={handleReject}
        isPending={rejectBlockRequest.isPending}
      />
    </PageLayout>
  )
}
