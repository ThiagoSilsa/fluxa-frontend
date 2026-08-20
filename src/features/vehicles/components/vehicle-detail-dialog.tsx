// React
import { useEffect, useMemo, useState } from 'react'

// Icons
import { Building2, Search, Trash2, UserPlus, Users } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useVehicleDetailQuery } from '../hooks/use-vehicle-detail-query'
import { useVehicleMutations } from '../hooks/use-vehicle-mutations'
import { useDriverCandidatesQuery } from '../hooks/use-driver-candidates-query'

// Types
import type { VehicleEntity, VehicleParameterOption } from '../types/vehicles.types'

// Shared hooks
import { useDebouncedValue } from '#/shared/hooks/use-debounced-value'

// Components
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '#/shared/components'

// Libs
import { cn } from '#/shared/lib/utils'

export type VehicleDetailDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Veículo cujo detalhe será exibido. */
  vehicle: VehicleEntity
  /** Departamentos ativos (do `parameters` da listagem). */
  departmentOptions: VehicleParameterOption[]
}

/**
 * Dialog de detalhe do veículo (aberto no clique da linha).
 *
 * Mostra os dados agregados (tipo, departamento, motoristas) e permite
 * gerenciar o **departamento padrão** (set/remove via `PUT`/`DELETE
 * /vehicles/:id/department`) e os **motoristas** (adicionar/remover/primário/
 * can_drive via `/vehicles/:id/drivers`).
 */
export function VehicleDetailDialog({
  open,
  onOpenChange,
  vehicle,
  departmentOptions,
}: VehicleDetailDialogProps) {
  const { t } = useTranslation('vehicles')

  // --- Detalhe agregado ---
  const { data: detail, isPending } = useVehicleDetailQuery(open ? vehicle.id : null)

  // --- Mutations de vínculos ---
  const { setVehicleDepartment, removeVehicleDepartment, addDriver, updateDriver, removeDriver } =
    useVehicleMutations()

  // --- Departamento ---
  const [departmentId, setDepartmentId] = useState<string>('')

  // --- Motoristas: adicionar ---
  const [candidateSearch, setCandidateSearch] = useState('')
  const debouncedCandidateSearch = useDebouncedValue(candidateSearch, 300)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('')
  const [showAddDriver, setShowAddDriver] = useState(false)

  const candidatesQuery = useDriverCandidatesQuery(debouncedCandidateSearch, open && showAddDriver)
  const candidates = useMemo(
    () =>
      (candidatesQuery.data?.data ?? []).filter(
        (candidate) => !detail?.drivers.some((driver) => driver.user.id === candidate.id),
      ),
    [candidatesQuery.data, detail],
  )

  // Pré-seleciona o departamento atual quando o detalhe carrega.
  useEffect(() => {
    if (detail) {
      setDepartmentId(detail.department?.id ?? '')
    }
  }, [detail])

  const handleSaveDepartment = () => {
    if (!departmentId) {
      return
    }
    void setVehicleDepartment.mutateAsync({ vehicleId: vehicle.id, departmentId })
  }

  const handleRemoveDepartment = () => {
    void removeVehicleDepartment.mutateAsync(vehicle.id)
  }

  const handleAddDriver = () => {
    if (!selectedCandidateId) {
      return
    }
    void addDriver
      .mutateAsync({ vehicleId: vehicle.id, payload: { userId: selectedCandidateId } })
      .then(() => {
        setSelectedCandidateId('')
        setCandidateSearch('')
        setShowAddDriver(false)
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('detail.title', { plate: vehicle.plate })}</DialogTitle>
          <DialogDescription>{t('detail.description')}</DialogDescription>
        </DialogHeader>

        {isPending || !detail ? (
          <p className="text-muted-foreground text-sm">{t('detail.loading')}</p>
        ) : (
          <div className="space-y-6">
            {/* Dados do veículo */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="px-2 text-xs" variant="outline">
                {detail.vehicleType?.name ?? '—'}
              </Badge>
              <Badge
                className={cn(
                  'shrink-0 px-2 text-xs',
                  detail.isActive
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'bg-muted text-muted-foreground',
                )}
                variant="outline"
              >
                {detail.isActive ? t('status.active') : t('status.inactive')}
              </Badge>
              <Badge
                className={cn(
                  'shrink-0 px-2 text-xs',
                  detail.freePass && 'border-amber-500 bg-amber-500/10 text-amber-700',
                )}
                variant="outline"
              >
                {detail.freePass ? t('freePass.yes') : t('freePass.no')}
              </Badge>
              {detail.isBlocked ? (
                <Badge variant="destructive" className="px-2 text-xs">
                  {t('detail.blocked')}
                </Badge>
              ) : null}
            </div>

            <div className="text-muted-foreground grid gap-1 text-sm sm:grid-cols-2">
              <div>
                <span className="font-medium">{t('detail.model')}:</span> {detail.model ?? '—'}
              </div>
              <div>
                <span className="font-medium">{t('detail.color')}:</span> {detail.color ?? '—'}
              </div>
              <div>
                <span className="font-medium">{t('detail.createdAt')}:</span>{' '}
                {new Date(detail.createdAt).toLocaleDateString()}
              </div>
            </div>

            {detail.observation ? (
              <p className="text-muted-foreground border-border border-t pt-3 text-sm">
                {detail.observation}
              </p>
            ) : null}

            {/* Departamento padrão */}
            <div className="border-border space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Building2 className="text-muted-foreground size-4" />
                <h3 className="text-foreground text-sm font-semibold">
                  {t('detail.department.title')}
                </h3>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Select value={departmentId || undefined} onValueChange={setDepartmentId}>
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue placeholder={t('detail.department.placeholder')} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {departmentOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveDepartment}
                    disabled={!departmentId || departmentId === (detail.department?.id ?? '')}
                  >
                    {t('detail.department.save')}
                  </Button>
                  {detail.department ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleRemoveDepartment}
                    >
                      {t('detail.department.remove')}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Motoristas */}
            <div className="border-border space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground size-4" />
                  <h3 className="text-foreground text-sm font-semibold">
                    {t('detail.drivers.title')}
                  </h3>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddDriver((prev) => !prev)}
                >
                  <UserPlus className="size-4" />
                  {t('detail.drivers.add')}
                </Button>
              </div>

              {showAddDriver ? (
                <div className="border-border space-y-2 rounded-lg border p-3">
                  <Label>{t('detail.drivers.search')}</Label>
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      value={candidateSearch}
                      onChange={(event) => setCandidateSearch(event.target.value)}
                      placeholder={t('detail.drivers.search-placeholder')}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select
                      value={selectedCandidateId || undefined}
                      onValueChange={setSelectedCandidateId}
                    >
                      <SelectTrigger className="w-full sm:flex-1">
                        <SelectValue placeholder={t('detail.drivers.candidate-placeholder')} />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {candidates.length === 0 ? (
                          <SelectItem value="__none__" disabled>
                            {t('detail.drivers.no-candidates')}
                          </SelectItem>
                        ) : (
                          candidates.map((candidate) => (
                            <SelectItem key={candidate.id} value={candidate.id}>
                              {candidate.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={handleAddDriver}
                      disabled={!selectedCandidateId || addDriver.isPending}
                    >
                      {t('detail.drivers.confirm-add')}
                    </Button>
                  </div>
                </div>
              ) : null}

              {detail.drivers.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t('detail.drivers.empty')}</p>
              ) : (
                <ul className="space-y-2">
                  {detail.drivers.map((driver) => (
                    <li
                      key={driver.id}
                      className="border-border flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="min-w-0">
                        <div className="text-foreground flex items-center gap-2 text-sm font-medium">
                          <span className="truncate">{driver.user.name}</span>
                          {driver.isPrimary ? (
                            <Badge className="px-2 text-xs" variant="default">
                              {t('detail.drivers.primary')}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1.5">
                            {t('detail.drivers.canDrive')}
                            <Switch
                              size="sm"
                              checked={driver.canDrive}
                              onCheckedChange={(value) =>
                                void updateDriver.mutateAsync({
                                  vehicleId: vehicle.id,
                                  userId: driver.user.id,
                                  payload: { canDrive: value },
                                })
                              }
                              aria-label={t('detail.drivers.canDrive')}
                            />
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {!driver.isPrimary ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="size-8"
                            onClick={() =>
                              void updateDriver.mutateAsync({
                                vehicleId: vehicle.id,
                                userId: driver.user.id,
                                payload: { isPrimary: true },
                              })
                            }
                            aria-label={t('detail.drivers.make-primary')}
                          >
                            ★
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10 hover:text-destructive size-8"
                          onClick={() =>
                            void removeDriver.mutateAsync({
                              vehicleId: vehicle.id,
                              userId: driver.user.id,
                            })
                          }
                          aria-label={t('detail.drivers.remove')}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
