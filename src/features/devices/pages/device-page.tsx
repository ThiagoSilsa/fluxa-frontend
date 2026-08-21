// React
import { useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { GoPlus } from 'react-icons/go'
import { Search } from 'lucide-react'

// Columns
import { createDeviceColumns } from '../config/device-columns'

// Components
import { DeviceFormDialog } from '../components/device-form-dialog'
import { DeviceDetailDialog } from '../components/device-detail-dialog'
import { DeviceTokenDialog } from '../components/device-token-dialog'

// Hooks
import { useDevicesQuery } from '../hooks/use-devices-query'
import { useDeviceMutations } from '../hooks/use-device-mutations'
import { useDeviceHandlers } from '../hooks/use-device-handlers'

// Types
import type { DeviceListParams, DeviceStatusFilterValue } from '../types/devices.types'

// Routes
import { devicesPath } from '../routes/devices.route'

// Shared components
import {
  Button,
  ConfirmDialog,
  GenericTable,
  Header,
  Input,
  Label,
  PageLayout,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components'

// Shared hooks
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'
import { useGenericTableSearch } from '#/shared/components/generic-table'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'

/** Acesso tipado aos search params da rota file-based. */
const routeApi = getRouteApi('/_private/management/devices')

/**
 * Página de gestão de dispositivos do app do porteiro.
 *
 * Tabela (`GenericTable`) com paginação, ordenação (nome/status/criação) e
 * busca por nome (server-side). Clique na linha abre o detalhe (portaria,
 * versão, último sync + rotação de token). Criação/rotação exibem o token
 * **uma única vez** (write-only — ADR 0008 §3). Acesso restrito a
 * `MANAGE_DEVICES`.
 */
export function DevicesPage() {
  const { t } = useTranslation('devices')
  const { t: tc } = useTranslation('common')

  // --- Search params da rota ---
  const search = routeApi.useSearch()
  const listParams = useMemo<DeviceListParams>(
    () => ({
      search: search.search,
      isActive: search.isActive,
      sortBy: search.sortBy,
      sortOrder: search.sortOrder,
      limit: search.limit,
      offset: search.offset,
    }),
    [search],
  )

  // --- Controles da GenericTable (paginação/ordenação via URL) ---
  const {
    pageIndex,
    pageSize,
    sorting,
    updateSearch,
    onPageChange,
    onPageSizeChange,
    onSortingChange,
  } = useGenericTableSearch({ path: devicesPath, search: listParams })

  // --- Busca com debounce ---
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const debouncedSearch = useDebouncedValue(searchInput, 400)

  // --- Queries ---
  const { data, isPending, error } = useDevicesQuery(listParams)

  // --- Mutations ---
  const { createDevice, updateDevice, deleteDevice, rotateToken } = useDeviceMutations()

  // --- Handlers ---
  const {
    formState,
    deleteTarget,
    setDeleteTarget,
    detailTarget,
    rotateTarget,
    tokenTarget,
    setTokenTarget,
    statusValue,
    handleStatusChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDetail,
    handleCloseDetail,
    handleSubmitForm,
    handleOpenRotate,
    handleCloseRotate,
    handleConfirmRotate,
    handleConfirmDelete,
  } = useDeviceHandlers({
    updateSearch,
    search: { isActive: search.isActive },
    createDevice,
    updateDevice,
    deleteDevice,
    rotateToken,
  })

  // --- Toast de erro da listagem ---
  useEffect(() => {
    if (error) {
      toast.error(tc(getAPIErrorTranslationKey(error)))
    }
  }, [error, tc])

  // Sincroniza o input de busca com o parâmetro da URL
  useEffect(() => {
    setSearchInput(search.search ?? '')
  }, [search.search])

  // Atualiza a busca na URL após o debounce
  useEffect(() => {
    const trimmed = debouncedSearch.trim()
    if ((search.search ?? '') === trimmed) {
      return
    }
    updateSearch({ search: trimmed.length ? trimmed : undefined })
  }, [debouncedSearch, search.search, updateSearch])

  const devices = data?.data ?? []
  const total = data?.count ?? 0

  // Opções de portarias ativas (do `parameters` da listagem).
  const parameters = data?.parameters
  const entranceOptions =
    parameters?.find((parameter) => parameter.key === 'entrance_id')?.allowed_values ?? []

  const isFormSubmitting = createDevice.isPending || updateDevice.isPending

  const columns = useMemo(
    () =>
      createDeviceColumns({
        t,
        onEdit: handleOpenEdit,
        onDelete: setDeleteTarget,
      }),
    [t, handleOpenEdit, setDeleteTarget],
  )

  const emptyState = (
    <div className="space-y-2">
      <p className="text-foreground text-base font-semibold">{t('empty.title')}</p>
      <p className="text-muted-foreground text-sm">{t('empty.description')}</p>
    </div>
  )

  return (
    <PageLayout>
      <Header title={t('title')} subtitle={t('subtitle')} />

      <GenericTable
        data={devices}
        columns={columns}
        loading={isPending}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        enableSorting
        onRowClick={handleOpenDetail}
        getRowAriaLabel={(row) => t('detail.ariaLabel', { name: row.name })}
        paginationLabels={{
          limit: tc('pagination.limit'),
          first: tc('pagination.first'),
          previous: tc('pagination.previous'),
          next: tc('pagination.next'),
          last: tc('pagination.last'),
        }}
        filters={
          <>
            {/* Busca com ícone */}
            <div className="relative sm:max-w-sm">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('search.placeholder')}
                className="pl-9"
              />
            </div>

            {/* Filtro de status */}
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground shrink-0 text-xs font-medium">
                {t('filters.status.label')}
              </Label>
              <Select
                value={statusValue}
                onValueChange={(value) => handleStatusChange(value as DeviceStatusFilterValue)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.status.all')}</SelectItem>
                  <SelectItem value="active">{t('filters.status.active')}</SelectItem>
                  <SelectItem value="inactive">{t('filters.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
        toolbar={
          <Button onClick={handleOpenCreate}>
            <GoPlus className="size-5" />
            {t('toolbar.create')}
          </Button>
        }
        emptyState={emptyState}
      />

      {/* Dialog de criação/edição */}
      {formState ? (
        <DeviceFormDialog
          key={formState.mode === 'edit' ? formState.device.id : 'create'}
          open
          onOpenChange={(open) => !open && handleCloseForm()}
          mode={formState.mode}
          device={formState.mode === 'edit' ? formState.device : undefined}
          isSubmitting={isFormSubmitting}
          submitLabel={formState.mode === 'create' ? t('toolbar.create') : t('toolbar.edit')}
          entranceOptions={entranceOptions}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {/* Detalhe do dispositivo (clique na linha) */}
      {detailTarget ? (
        <DeviceDetailDialog
          key={detailTarget.id}
          open
          onOpenChange={(open) => !open && handleCloseDetail()}
          device={detailTarget}
          onRotate={handleOpenRotate}
        />
      ) : null}

      {/* Token recém-gerado (criação/rotação — exibido uma única vez) */}
      {tokenTarget ? (
        <DeviceTokenDialog
          key={`${tokenTarget.device.id}-${tokenTarget.token}`}
          open
          onOpenChange={(open) => !open && setTokenTarget(null)}
          target={tokenTarget}
        />
      ) : null}

      {/* Confirmação de rotação de token */}
      <ConfirmDialog
        open={!!rotateTarget}
        onOpenChange={(open) => !open && handleCloseRotate()}
        title={t('confirm.rotate.title')}
        description={t('confirm.rotate.description', { name: rotateTarget?.name ?? '' })}
        confirmLabel={t('confirm.rotate.confirm')}
        cancelLabel={t('confirm.rotate.cancel')}
        onConfirm={handleConfirmRotate}
        isPending={rotateToken.isPending}
      />

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('confirm.delete.title')}
        description={t('confirm.delete.description', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('confirm.delete.confirm')}
        cancelLabel={t('confirm.delete.cancel')}
        onConfirm={handleConfirmDelete}
        variant="destructive"
        isPending={deleteDevice.isPending}
      />
    </PageLayout>
  )
}
