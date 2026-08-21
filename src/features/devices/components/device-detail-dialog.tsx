// React
import { useCallback } from 'react'

// Icons
import { KeyRound, Smartphone } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { DeviceEntity } from '../types/devices.types'

// Components
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/shared/components'

// Libs
import { cn } from '#/shared/lib/utils'

export type DeviceDetailDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Dispositivo cujo detalhe será exibido. */
  device: DeviceEntity
  /** Dispara o fluxo de rotação de token (com confirmação na página). */
  onRotate: (device: DeviceEntity) => void
}

/** Formata uma data ISO para exibição local (data + hora curta). */
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString()
}

/**
 * Dialog de detalhe do dispositivo (aberto no clique da linha).
 *
 * Mostra os dados agregados (portaria, versão do app, último sync, status) e
 * disponibiliza a **rotação de token** (write-only — ADR 0008 §3): invalida o
 * token anterior e exibe o novo uma única vez.
 */
export function DeviceDetailDialog({
  open,
  onOpenChange,
  device,
  onRotate,
}: DeviceDetailDialogProps) {
  const { t } = useTranslation('devices')

  const handleRotate = useCallback(() => {
    onRotate(device)
  }, [device, onRotate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="size-5" />
            {t('detail.title', { name: device.name })}
          </DialogTitle>
          <DialogDescription>{t('detail.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{t('detail.platform')}</span>
            <Badge variant="outline">{device.platform}</Badge>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{t('detail.entrance')}</span>
            <span>{device.entrance?.name ?? '—'}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{t('detail.appVersion')}</span>
            <span>{device.appVersion ?? '—'}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{t('detail.lastSyncAt')}</span>
            <span>{device.lastSyncAt ? formatDateTime(device.lastSyncAt) : '—'}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{t('detail.status')}</span>
            <Badge
              className={cn(
                'shrink-0 px-2 text-xs',
                device.isActive
                  ? 'bg-primary/10 text-primary border-primary'
                  : 'bg-muted text-muted-foreground',
              )}
              variant="outline"
            >
              {device.isActive ? t('status.active') : t('status.inactive')}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{t('detail.createdAt')}</span>
            <span>{formatDateTime(device.createdAt)}</span>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('detail.close')}
          </Button>
          <Button type="button" variant="outline" onClick={handleRotate}>
            <KeyRound className="size-4" />
            {t('detail.rotate-token')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
