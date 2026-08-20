// React
import { useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { GoPlus } from 'react-icons/go'
import { Search } from 'lucide-react'

// Columns
import { createVehicleColumns } from '../config/vehicle-columns'

// Components
import { VehicleFormDialog } from '../components/vehicle-form-dialog'
import { VehicleDetailDialog } from '../components/vehicle-detail-dialog'

// Hooks
import { useVehiclesQuery } from '../hooks/use-vehicles-query'
import { useVehicleMutations } from '../hooks/use-vehicle-mutations'
import { useVehicleHandlers } from '../hooks/use-vehicle-handlers'

// Types
import type {
  VehicleFreePassFilterValue,
  VehicleListParams,
  VehicleStatusFilterValue,
} from '../types/vehicles.types'

// Routes
import { vehiclesPath } from '../routes/vehicles.route'

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
import { canAccess } from '#/shared/lib/auth-access'
import { PermissionCode } from '#/shared/enum/permission-code'

// Providers
import { useAuth } from '#/app/providers/auth-provider'

/** Acesso tipado aos search params da rota file-based. */
const routeApi = getRouteApi('/_private/management/vehicles')

/**
 * Página de gestão de veículos.
 *
 * Tabela (`GenericTable`) com paginação, ordenação (placa/status/criação) e
 * busca por placa/modelo (server-side). Clique na linha abre o detalhe
 * (departamento + motoristas gerenciáveis). Acesso restrito a
 * `MANAGE_VEHICLES`; `freePass` exige `GRANT_FREE_PASS`.
 */
export function VehiclesPage() {
  const { t } = useTranslation('vehicles')
  const { t: tc } = useTranslation('common')
  const { user } = useAuth()

  const canManage = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.MANAGE_VEHICLES] }),
    [user],
  )
  const canGrantFreePass = useMemo(
    () => canAccess(user, { permissions: [PermissionCode.GRANT_FREE_PASS] }),
    [user],
  )

  // --- Search params da rota ---
  const search = routeApi.useSearch()
  const listParams = useMemo<VehicleListParams>(
    () => ({
      search: search.search,
      vehicleTypeId: search.vehicleTypeId,
      departmentId: search.departmentId,
      freePass: search.freePass,
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
  } = useGenericTableSearch({ path: vehiclesPath, search: listParams })

  // --- Busca com debounce ---
  const [searchInput, setSearchInput] = useState(search.search ?? '')
  const debouncedSearch = useDebouncedValue(searchInput, 400)

  // --- Queries ---
  const { data, isPending, error } = useVehiclesQuery(listParams)

  // --- Mutations ---
  const {
    createVehicle,
    updateVehicle,
    deleteVehicle,
    setVehicleDepartment,
    removeVehicleDepartment,
  } = useVehicleMutations()

  // --- Handlers ---
  const {
    formState,
    deleteTarget,
    setDeleteTarget,
    detailTarget,
    statusValue,
    handleStatusChange,
    freePassValue,
    handleFreePassChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDetail,
    handleCloseDetail,
    handleCurrentDepartmentChange,
    handleSubmitForm,
    handleConfirmDelete,
  } = useVehicleHandlers({
    updateSearch,
    search: {
      isActive: search.isActive,
      freePass: search.freePass,
      vehicleTypeId: search.vehicleTypeId,
      departmentId: search.departmentId,
    },
    createVehicle,
    updateVehicle,
    deleteVehicle,
    setVehicleDepartment,
    removeVehicleDepartment,
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

  const vehicles = data?.data ?? []
  const total = data?.count ?? 0

  // Opções de filtros (tipos/departamentos ativos do `parameters`).
  const parameters = data?.parameters
  const typeOptions =
    parameters?.find((parameter) => parameter.key === 'vehicle_type_id')?.allowed_values ?? []
  const departmentOptions =
    parameters?.find((parameter) => parameter.key === 'department_id')?.allowed_values ?? []

  const isFormSubmitting = createVehicle.isPending || updateVehicle.isPending

  const columns = useMemo(
    () =>
      createVehicleColumns({
        t,
        canManage,
        onEdit: handleOpenEdit,
        onDelete: setDeleteTarget,
      }),
    [t, canManage, handleOpenEdit, setDeleteTarget],
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
        data={vehicles}
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
        getRowAriaLabel={(row) => t('detail.ariaLabel', { plate: row.plate })}
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
                onValueChange={(value) => handleStatusChange(value as VehicleStatusFilterValue)}
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

            {/* Filtro de livre acesso */}
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground shrink-0 text-xs font-medium">
                {t('filters.freePass.label')}
              </Label>
              <Select
                value={freePassValue}
                onValueChange={(value) => handleFreePassChange(value as VehicleFreePassFilterValue)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.freePass.all')}</SelectItem>
                  <SelectItem value="free">{t('filters.freePass.free')}</SelectItem>
                  <SelectItem value="no-free">{t('filters.freePass.no-free')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de tipo */}
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground shrink-0 text-xs font-medium">
                {t('filters.type.label')}
              </Label>
              <Select
                value={search.vehicleTypeId ?? 'all'}
                onValueChange={(value) =>
                  updateSearch({
                    vehicleTypeId: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.type.all')}</SelectItem>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de departamento */}
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground shrink-0 text-xs font-medium">
                {t('filters.department.label')}
              </Label>
              <Select
                value={search.departmentId ?? 'all'}
                onValueChange={(value) =>
                  updateSearch({
                    departmentId: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.department.all')}</SelectItem>
                  {departmentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
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
      />

      {/* Dialog de criação/edição */}
      {formState ? (
        <VehicleFormDialog
          key={formState.mode === 'edit' ? formState.vehicle.id : 'create'}
          open
          onOpenChange={(open) => !open && handleCloseForm()}
          mode={formState.mode}
          vehicle={formState.mode === 'edit' ? formState.vehicle : undefined}
          isSubmitting={isFormSubmitting}
          submitLabel={formState.mode === 'create' ? t('toolbar.create') : t('toolbar.edit')}
          typeOptions={typeOptions}
          departmentOptions={departmentOptions}
          canGrantFreePass={canGrantFreePass}
          onCurrentDepartmentChange={handleCurrentDepartmentChange}
          onSubmit={handleSubmitForm}
        />
      ) : null}

      {/* Detalhe do veículo (clique na linha) */}
      {detailTarget ? (
        <VehicleDetailDialog
          key={detailTarget.id}
          open
          onOpenChange={(open) => !open && handleCloseDetail()}
          vehicle={detailTarget}
          departmentOptions={departmentOptions}
        />
      ) : null}

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('confirm.delete.title')}
        description={t('confirm.delete.description', { plate: deleteTarget?.name ?? '' })}
        confirmLabel={t('confirm.delete.confirm')}
        cancelLabel={t('confirm.delete.cancel')}
        onConfirm={handleConfirmDelete}
        variant="destructive"
        isPending={deleteVehicle.isPending}
      />
    </PageLayout>
  )
}
