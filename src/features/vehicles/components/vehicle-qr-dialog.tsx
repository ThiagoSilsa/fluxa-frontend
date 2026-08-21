// React
import { useEffect, useMemo, useState } from 'react'

// Icons
import { Printer, QrCode, RefreshCw, ShieldOff } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useVehicleQrQuery } from '../hooks/use-vehicle-qr-query'
import { useVehicleQrMutations } from '../hooks/use-vehicle-qr-mutations'

// Libs
import { generateQrSvg, openQrPrintWindow } from '../lib/qr-code.lib'

// Types
import type { VehicleEntity } from '../types/vehicles.types'

// Components
import {
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/shared/components'

// Libs
import { cn } from '#/shared/lib/utils'

export type VehicleQrDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Veículo cujo QR será exibido/emitido. */
  vehicle: VehicleEntity
}

/** Ação de confirmação do dialog (reemitir/revogar). */
type QrConfirmAction = 'reissue' | 'revoke' | null

/**
 * Dialog de QR code do veículo (ADR 0009).
 *
 * Sem QR ativo → oferece **Emitir QR** (primeiro adesivo). Com QR ativo →
 * exibe o SVG (gerado no client do `code` — nada é salvo) + ações:
 * **Imprimir** (janela limpa com QR + placa), **Reemitir** (revoga o atual e
 * gera novo adesivo) e **Revogar** (desativa sem emitir outro — "expirado").
 * Reemitir/Revogar exigem confirmação.
 */
export function VehicleQrDialog({ open, onOpenChange, vehicle }: VehicleQrDialogProps) {
  const { t } = useTranslation('vehicles')

  const { data: qr, isPending } = useVehicleQrQuery(open ? vehicle.id : null)
  const { emit, reissue, revoke } = useVehicleQrMutations(vehicle.id)

  const [svg, setSvg] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<QrConfirmAction>(null)

  // Regenera o SVG sempre que o QR ativo muda (mesmo code → mesma imagem).
  useEffect(() => {
    let active = true
    if (!qr) {
      setSvg(null)
      return
    }
    void generateQrSvg(qr.code).then((generated) => {
      if (active) {
        setSvg(generated)
      }
    })
    return () => {
      active = false
    }
  }, [qr])

  const isBusy = emit.isPending || reissue.isPending || revoke.isPending

  const confirmConfig = useMemo(() => {
    if (confirmAction === 'reissue') {
      return {
        title: t('qr.reissue-confirm.title'),
        description: t('qr.reissue-confirm.description', { plate: vehicle.plate }),
        confirm: t('qr.reissue-confirm.confirm'),
        onConfirm: () => void reissue.mutateAsync().finally(() => setConfirmAction(null)),
      }
    }
    if (confirmAction === 'revoke') {
      return {
        title: t('qr.revoke-confirm.title'),
        description: t('qr.revoke-confirm.description', { plate: vehicle.plate }),
        confirm: t('qr.revoke-confirm.confirm'),
        onConfirm: () => void revoke.mutateAsync().finally(() => setConfirmAction(null)),
      }
    }
    return null
  }, [confirmAction, vehicle.plate, reissue, revoke, t])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5" />
            {t('qr.title', { plate: vehicle.plate })}
          </DialogTitle>
          <DialogDescription>{t('qr.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {isPending ? (
            <p className="text-muted-foreground py-8 text-sm">{t('qr.loading')}</p>
          ) : !qr ? (
            // Sem QR ativo — oferece a emissão do primeiro adesivo.
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-foreground text-sm font-medium">{t('qr.no-qr.title')}</p>
              <p className="text-muted-foreground max-w-xs text-xs">{t('qr.no-qr.description')}</p>
              <Button type="button" onClick={() => void emit.mutateAsync()} disabled={isBusy}>
                <QrCode className="size-4" />
                {t('qr.no-qr.emit')}
              </Button>
            </div>
          ) : (
            // QR ativo — exibe o SVG + ações.
            <>
              <Badge
                className={cn(
                  'shrink-0 px-2 text-xs',
                  qr.isActive
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'bg-muted text-muted-foreground',
                )}
                variant="outline"
              >
                {qr.isActive ? t('qr.status.active') : t('qr.status.inactive')}
              </Badge>

              {svg ? (
                <div
                  className="size-56 rounded-lg border p-2"
                  dangerouslySetInnerHTML={{ __html: svg }}
                  aria-label={t('qr.aria-qr')}
                />
              ) : (
                <div className="text-muted-foreground flex size-56 items-center justify-center rounded-lg border text-sm">
                  {t('qr.generating')}
                </div>
              )}

              <p className="text-foreground text-lg font-bold tracking-[0.2em]">{vehicle.plate}</p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => svg && openQrPrintWindow(svg, vehicle.plate)}
                  disabled={!svg}
                >
                  <Printer className="size-4" />
                  {t('qr.print')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setConfirmAction('reissue')}>
                  <RefreshCw className="size-4" />
                  {t('qr.reissue')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmAction('revoke')}
                >
                  <ShieldOff className="size-4" />
                  {t('qr.revoke')}
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('qr.close')}
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(openChange) => !openChange && setConfirmAction(null)}
        title={confirmConfig?.title ?? ''}
        description={confirmConfig?.description ?? ''}
        confirmLabel={confirmConfig?.confirm ?? ''}
        cancelLabel={t('qr.cancel')}
        onConfirm={confirmConfig?.onConfirm ?? (() => undefined)}
        variant={confirmAction === 'revoke' ? 'destructive' : 'default'}
        isPending={isBusy}
      />
    </Dialog>
  )
}
