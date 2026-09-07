// React
import { useEffect, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useVehicleTypesOptionsQuery } from '../hooks/use-vehicle-types-options-query'

// Lib
import { formatDateTime } from './detail-format'

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
 * aceitar (com seleção do tipo de veículo quando o aceite cria veículo),
 * marcar em contato, rejeitar e cancelar (porteiro — PENDING).
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

  const [vehicleTypeId, setVehicleTypeId] = useState('')
  const [confirmReject, setConfirmReject] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const { data: vehicleTypes } = useVehicleTypesOptionsQuery()

  // Reinicia o estado do aceite ao abrir/exibir outra solicitação.
  useEffect(() => {
    if (open) {
      setVehicleTypeId('')
    }
  }, [open, request?.id])

  if (!request) {
    return null
  }

  const needsVehicleType = request.type === 'NEW_VEHICLE' || request.type === 'BOTH'
  const isActionable = request.status === 'PENDING' || request.status === 'IN_CONTACT'

  const handleAccept = () => {
    const payload: AcceptAccessRequestPayload = {
      canDrive: true,
      isPrimary: false,
    }
    if (needsVehicleType) {
      if (!vehicleTypeId) {
        return
      }
      payload.vehicleTypeId = vehicleTypeId
    }
    onAccept(payload)
  }

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

            {/* Aceite: tipo do veículo a criar */}
            {canManage && isActionable && needsVehicleType ? (
              <div className="space-y-2 rounded-md border p-3">
                <Label htmlFor="accept-vehicle-type">
                  {t('detail.vehicleType.label')}
                  <span className="text-destructive"> *</span>
                </Label>
                <Select value={vehicleTypeId} onValueChange={setVehicleTypeId}>
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
                  disabled={isPending || (needsVehicleType && !vehicleTypeId)}
                  onClick={handleAccept}
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
