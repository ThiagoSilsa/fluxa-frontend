// React
import { useEffect, useMemo, useState } from 'react'

// Router
import { getRouteApi } from '@tanstack/react-router'

// i18n
import { useTranslation } from 'react-i18next'

// Toast
import { toast } from 'sonner'

// Icons
import { GoPlus } from 'react-icons/go'
import { Search } from 'lucide-react'

// Components
import { VehicleTypeCard } from '../components/vehicle-type-card'
import { VehicleTypeFormDialog } from '../components/vehicle-type-form-dialog'

// Hooks
import { useVehicleTypesQuery } from '../hooks/use-vehicle-types-query'
import { useVehicleTypeMutations } from '../hooks/use-vehicle-type-mutations'
import { useVehicleTypeHandlers } from '../hooks/use-vehicle-type-handlers'

// Types
import type {
  VehicleTypeFleetFilterValue,
  VehicleTypeListParams,
  VehicleTypeStatusFilterValue,
} from '../types/vehicle-types.types'

// Routes
import { vehicleTypesPath } from '../routes/vehicle-types.route'

// Shared components
import {
  Button,
  ConfirmDialog,
  EntityList,
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
import { useEntityListSearch } from '#/shared/components/entity-list'

// Shared libs
import { getAPIErrorTranslationKey } from '#/shared/lib/api-error'
import { canAccess } from '#/shared/lib/auth-access'
import { PermissionCode } from '#/shared/enum/permission-code'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

/** Acesso tipado aos search params da rota file-based de tipos de veículo. */
const routeApi = getRouteApi('/_private/management/vehicle-types')

/**
 * Página de gestão de tipos de veículo.
 *
 * Lista paginada (EntityList) com busca e filtros de status e de frota
 * (server-side), criação, edição (Switch de status e de classificação) e
 * exclusão física com confirmação — bloqueada (409) quando há veículos da
 * empresa usando o tipo.
 */
export function VehicleTypePage() {
  const { t } = useTranslation('vehicleTypes')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()

  const canManage = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.MANAGE_VEHICLE_TYPES] }),
    [user],
  )

  // --- Search params da rota ---
  const search = routeApi.useSearch()
  const listParams = useMemo<VehicleTypeListParams>(
    () => ({
      search: search.search,
      isFleet: search.isFleet,
      isActive: search.isActive,
      limit: search.limit,
      offset: search.offset,
    }),
    [search],
  )

  // --- Controles de paginação/busca (sincronizados com a URL) ---
  const { updateSearch, updateLimit, updateOffset } = useEntityListSearch({
    path: vehicleTypesPath,
    search: listParams,
  })

  // --- Busca com debounce ---
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const debouncedSearch = useDebouncedValue(searchInput, 400)

  // --- Queries ---
  const { data, isPending, error } = useVehicleTypesQuery(listParams)

  // --- Mutations ---
  const { createVehicleType, updateVehicleType, deleteVehicleType } = useVehicleTypeMutations()

  // --- Handlers ---
  const {
    formState,
    deleteTarget,
    setDeleteTarget,
    statusValue,
    handleStatusChange,
    isFleetValue,
    handleIsFleetChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSubmitForm,
    handleConfirmDelete,
  } = useVehicleTypeHandlers({
    updateSearch,
    search: { isActive: search.isActive, isFleet: search.isFleet },
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,
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

  const vehicleTypes = data?.data ?? []
  const total = data?.count ?? 0
  const isFormSubmitting = createVehicleType.isPending || updateVehicleType.isPending

  const emptyState = (
    <div className="space-y-2">
      <p className="text-foreground text-base font-semibold">{t('empty.title')}</p>
      <p className="text-muted-foreground text-sm">{t('empty.description')}</p>
    </div>
  )

  return (
    <PageLayout>
      <Header title={t('title')} subtitle={t('subtitle')} />

      <EntityList
        items={vehicleTypes}
        total={total}
        loading={isPending}
        renderItem={(item) => (
          <VehicleTypeCard
            vehicleType={item}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTarget}
            canManage={canManage}
          />
        )}
        filters={
          <>
            <div className="relative sm:max-w-sm">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('search.placeholder')}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground shrink-0 text-xs font-medium">
                {t('filters.status.label')}
              </Label>
              <Select
                value={statusValue}
                onValueChange={(value) => handleStatusChange(value as VehicleTypeStatusFilterValue)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.status.all')}</SelectItem>
                  <SelectItem value="active">{t('filters.status.active')}</SelectItem>
                  <SelectItem value="inactive">{t('filters.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground shrink-0 text-xs font-medium">
                {t('filters.isFleet.label')}
              </Label>
              <Select
                value={isFleetValue}
                onValueChange={(value) => handleIsFleetChange(value as VehicleTypeFleetFilterValue)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.isFleet.all')}</SelectItem>
                  <SelectItem value="fleet">{t('filters.isFleet.fleet')}</SelectItem>
                  <SelectItem value="non-fleet">{t('filters.isFleet.non-fleet')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        }
        toolbar={
          canManage && (
            <Button onClick={handleOpenCreate}>
              <GoPlus className="size-5" />
              {t('toolbar.create')}
            </Button>
          )
        }
        emptyState={emptyState}
        gridClassName="grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        pagination={{
          limit: search.limit,
          offset: search.offset,
          onLimitChange: updateLimit,
          onOffsetChange: updateOffset,
          labels: {
            limit: tc('pagination.limit'),
            first: tc('pagination.first'),
            previous: tc('pagination.previous'),
            next: tc('pagination.next'),
            last: tc('pagination.last'),
          },
        }}
      />

      {/* Dialog de criação/edição */}
      {formState ? (
        <VehicleTypeFormDialog
          key={formState.mode === 'edit' ? formState.vehicleType?.id : 'create'}
          open
          onOpenChange={(open) => !open && handleCloseForm()}
          mode={formState.mode}
          vehicleType={formState.vehicleType}
          isSubmitting={isFormSubmitting}
          submitLabel={formState.mode === 'create' ? t('toolbar.create') : t('toolbar.edit')}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {/* Confirmação de exclusão (física — ADR 0006 §6, 409 se em uso) */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('confirm.delete.title')}
        description={t('confirm.delete.description', {
          name: deleteTarget?.name ?? '',
        })}
        confirmLabel={t('confirm.delete.confirm')}
        cancelLabel={t('confirm.delete.cancel')}
        onConfirm={handleConfirmDelete}
        variant="destructive"
        isPending={deleteVehicleType.isPending}
      />
    </PageLayout>
  )
}
