// React
import { useEffect, useMemo, useState } from 'react'

// React Hook Form
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useRoleOptionsQuery } from '../hooks/use-role-options-query'
import { useVehicleTypesOptionsQuery } from '../hooks/use-vehicle-types-options-query'

// Lib
import {
  accessRequestCreatesVehicle,
  accessRequestNeedsEmployeeCredentials,
  getAccessRequestUserTypeLabelKey,
} from '../lib/access-request.lib'
import { formatDateTime } from './detail-format'

// Mappers
import { toAcceptAccessRequestPayload } from '../mappers/access-request.mapper'

// Schemas
import {
  ACCEPT_ACCESS_REQUEST_DEFAULT_VALUES,
  ACCEPT_PASSWORD_MIN_LENGTH,
  buildAcceptAccessRequestSchema,
} from '../schemas/accept-access-request.schema'
import type { AcceptAccessRequestFormValues } from '../schemas/accept-access-request.schema'

// Components
import { AccessRequestStatusBadge } from './status-badge'

// Types
import type {
  AcceptAccessRequestPayload,
  AccessRequestResponse,
} from '../types/access-requests.types'

// Shared
import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components'

export type AccessRequestDetailDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Solicitação em exibição (ou `null`). */
  request: AccessRequestResponse | null
  /** Se o ator pode aceitar/rejeitar/em-contato (MANAGE_ACCESS_REQUESTS). */
  canManage: boolean
  /** Se o ator pode cancelar a própria solicitação (CANCEL_ACCESS_REQUEST). */
  canCancel: boolean
  /** Desabilita as ações enquanto uma transição está pendente. */
  isPending: boolean
  /** Aceita a solicitação (com dados do aceite). */
  onAccept: (payload: AcceptAccessRequestPayload) => void
  /** Rejeita a solicitação. */
  onReject: () => void
  /** Marca como em contato. */
  onMarkInContact: () => void
  /** Cancela a solicitação. */
  onCancel: () => void
}

/**
 * Linha do detalhe (rótulo + valor).
 */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

/**
 * Dialog de detalhe de uma solicitação de acesso (administração/porteiro).
 *
 * Exibe os dados da solicitação e as ações conforme permissão e status:
 * aceitar (com o tipo do veículo quando o aceite cria veículo e com cargo +
 * senha quando o motorista a criar é Colaborador — ADR 0013), marcar em
 * contato, rejeitar e cancelar (porteiro — PENDING).
 */
export function AccessRequestDetailDialog({
  open,
  onOpenChange,
  request,
  canManage,
  canCancel,
  isPending,
  onAccept,
  onReject,
  onMarkInContact,
  onCancel,
}: AccessRequestDetailDialogProps) {
  const { t } = useTranslation('accessRequests')

  const [confirmReject, setConfirmReject] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  // O que o aceite exige depende do cenário e do tipo de usuário da solicitação.
  const needsVehicleType = request ? accessRequestCreatesVehicle(request.type) : false
  const needsEmployeeCredentials = request
    ? accessRequestNeedsEmployeeCredentials(request.type, request.userType)
    : false

  const { data: vehicleTypes } = useVehicleTypesOptionsQuery()
  // Cargos só são consultados quando o aceite cria um Colaborador.
  const { data: roles } = useRoleOptionsQuery(needsEmployeeCredentials)

  const acceptSchema = useMemo(
    () => buildAcceptAccessRequestSchema({ needsVehicleType, needsEmployeeCredentials }),
    [needsVehicleType, needsEmployeeCredentials],
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AcceptAccessRequestFormValues>({
    resolver: zodResolver(acceptSchema),
    defaultValues: ACCEPT_ACCESS_REQUEST_DEFAULT_VALUES,
    mode: 'onTouched',
  })

  const acceptValues = watch()
  // Botão de aceitar bloqueado enquanto o que o cenário exige não foi preenchido.
  const canAccept =
    (!needsVehicleType || !!acceptValues.vehicleTypeId) &&
    (!needsEmployeeCredentials ||
      (!!acceptValues.roleId && acceptValues.password.trim().length >= ACCEPT_PASSWORD_MIN_LENGTH))

  // Reinicia o estado do aceite ao abrir/exibir outra solicitação.
  useEffect(() => {
    if (open) {
      reset(ACCEPT_ACCESS_REQUEST_DEFAULT_VALUES)
    }
  }, [open, request?.id, reset])

  if (!request) {
    return null
  }

  const isActionable = request.status === 'PENDING' || request.status === 'IN_CONTACT'

  const submitAccept = handleSubmit((values) => {
    onAccept(toAcceptAccessRequestPayload(values, request))
  })

  const driver = request.payload?.driver
  const vehicle = request.payload?.vehicle

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {t('detail.title', { plate: request.plate })}
              <AccessRequestStatusBadge status={request.status} />
            </DialogTitle>
            <DialogDescription>{t(`type.${request.type}`)}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <DetailRow label={t('detail.requestedBy')} value={request.requestedBy.name} />
              <DetailRow
                label={t('detail.requestedAt')}
                value={formatDateTime(request.requestedAt)}
              />
              <DetailRow
                label={t('detail.handledBy')}
                value={request.handledBy?.name ?? t('detail.notHandled')}
              />
              <DetailRow label={t('detail.handledAt')} value={formatDateTime(request.handledAt)} />
              <DetailRow
                label={t('detail.entryAuthorized')}
                value={request.entryAuthorized ? t('detail.yes') : t('detail.no')}
              />
            </div>

            {request.contactPhone ? (
              <div className="space-y-2">
                <DetailRow
                  label={t('detail.contactChannel')}
                  value={request.contactChannel ?? '—'}
                />
                <DetailRow label={t('detail.contactPhone')} value={request.contactPhone} />
              </div>
            ) : null}

            {driver ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('detail.driver')}</p>
                <DetailRow
                  label={t('detail.userType')}
                  value={t(getAccessRequestUserTypeLabelKey(request.userType))}
                />
                {driver.name ? (
                  <DetailRow label={t('create.driver.name.label')} value={driver.name} />
                ) : null}
                {driver.email ? (
                  <DetailRow label={t('create.driver.email.label')} value={driver.email} />
                ) : null}
                {driver.document ? (
                  <DetailRow label={t('create.driver.document.label')} value={driver.document} />
                ) : null}
                {driver.phone ? (
                  <DetailRow label={t('create.driver.phone.label')} value={driver.phone} />
                ) : null}
              </div>
            ) : null}

            {vehicle ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('detail.vehicle')}</p>
                {vehicle.model ? (
                  <DetailRow label={t('create.vehicleData.model.label')} value={vehicle.model} />
                ) : null}
                {vehicle.color ? (
                  <DetailRow label={t('create.vehicleData.color.label')} value={vehicle.color} />
                ) : null}
              </div>
            ) : null}

            {request.resolvedUserId || request.resolvedVehicleId ? (
              <div className="space-y-2">
                {request.resolvedUserId ? (
                  <DetailRow label={t('detail.resolvedUser')} value={request.resolvedUserId} />
                ) : null}
                {request.resolvedVehicleId ? (
                  <DetailRow
                    label={t('detail.resolvedVehicle')}
                    value={request.resolvedVehicleId}
                  />
                ) : null}
              </div>
            ) : null}

            {request.observation ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('detail.observation')}</p>
                <p className="text-muted-foreground text-sm">{request.observation}</p>
              </div>
            ) : null}

            {/* Aceite: o que o cenário exige (tipo do veículo — regra 22;
                cargo + senha do Colaborador — ADR 0013) */}
            {canManage && isActionable && (needsVehicleType || needsEmployeeCredentials) ? (
              <div className="space-y-4 rounded-md border p-3">
                {needsVehicleType ? (
                  <div className="space-y-2">
                    <Label htmlFor="accept-vehicle-type">
                      {t('detail.vehicleType.label')}
                      <span className="text-destructive"> *</span>
                    </Label>
                    <Controller
                      control={control}
                      name="vehicleTypeId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="accept-vehicle-type">
                            <SelectValue placeholder={t('detail.vehicleType.placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {(vehicleTypes ?? []).map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.vehicleTypeId?.message ? (
                      <p className="text-destructive text-xs">{t(errors.vehicleTypeId.message)}</p>
                    ) : null}
                  </div>
                ) : null}

                {needsEmployeeCredentials ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="accept-role">
                        {t('detail.role.label')}
                        <span className="text-destructive"> *</span>
                      </Label>
                      <Controller
                        control={control}
                        name="roleId"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="accept-role">
                              <SelectValue placeholder={t('detail.role.placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {(roles ?? []).map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.roleId?.message ? (
                        <p className="text-destructive text-xs">{t(errors.roleId.message)}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accept-password">
                        {t('detail.password.label')}
                        <span className="text-destructive"> *</span>
                      </Label>
                      <Input
                        id="accept-password"
                        type="password"
                        autoComplete="new-password"
                        {...register('password')}
                        aria-invalid={!!errors.password}
                        placeholder={t('detail.password.placeholder')}
                      />
                      {errors.password?.message ? (
                        <p className="text-destructive text-xs">{t(errors.password.message)}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <p className="text-muted-foreground text-xs">{t('detail.acceptHint')}</p>
              </div>
            ) : null}
          </div>

          <DialogFooter className="flex-wrap gap-2">
            {canManage && isActionable ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending || !canAccept}
                  onClick={submitAccept}
                >
                  {t('actions.accept')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={onMarkInContact}
                >
                  {t('actions.inContact')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => setConfirmReject(true)}
                >
                  {t('actions.reject')}
                </Button>
              </>
            ) : null}

            {canCancel && request.status === 'PENDING' ? (
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => setConfirmCancel(true)}
              >
                {t('actions.cancel')}
              </Button>
            ) : null}

            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t('actions.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmReject}
        onOpenChange={setConfirmReject}
        title={t('confirm.reject-title')}
        description={t('confirm.reject-description')}
        confirmLabel={t('confirm.confirm')}
        cancelLabel={t('confirm.cancel')}
        onConfirm={() => {
          setConfirmReject(false)
          onReject()
        }}
        isPending={isPending}
      />

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title={t('confirm.cancel-title')}
        description={t('confirm.cancel-description')}
        confirmLabel={t('confirm.confirm')}
        cancelLabel={t('confirm.cancel')}
        onConfirm={() => {
          setConfirmCancel(false)
          onCancel()
        }}
        isPending={isPending}
      />
    </>
  )
}
