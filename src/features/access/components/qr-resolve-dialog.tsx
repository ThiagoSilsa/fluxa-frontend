// React
import { useEffect, useState } from 'react'

// i18n
import { useTranslation } from 'react-i18next'

// Hooks
import { useQrResolveQuery } from '../hooks/use-qr-resolve-query'

// Types
import type { ResolvedVehicleQr } from '../types/access.types'

// Shared
import { isApiError } from '#/shared/lib/api-error'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '#/shared/components'

export type QrResolveDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Callback com o veículo resolvido (preenche a placa). */
  onResolved: (vehicle: ResolvedVehicleQr) => void
}

/**
 * Dialog de leitura de QR na portaria.
 *
 * O porteiro cola o código do veículo (token permanente do QR — ADR 0009 §5)
 * e o dialog resolve via `GET /qr-codes/:code`, devolvendo o veículo para
 * preencher a placa do formulário de entrada.
 */
export function QrResolveDialog({ open, onOpenChange, onResolved }: QrResolveDialogProps) {
  const { t } = useTranslation('access')

  const [code, setCode] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)

  const { data, isPending, isError, error } = useQrResolveQuery(open ? submitted : null)

  // Ao resolver, devolve o veículo para o formulário e fecha o dialog.
  useEffect(() => {
    if (open && data) {
      onResolved(data)
      setCode('')
      setSubmitted(null)
      onOpenChange(false)
    }
  }, [open, data, onResolved, onOpenChange])

  const handleResolve = () => {
    const trimmed = code.trim()
    if (!trimmed) {
      return
    }
    setSubmitted(trimmed)
  }

  const handleClose = () => {
    setCode('')
    setSubmitted(null)
    onOpenChange(false)
  }

  const notFound = isError && isApiError(error) && error.statusCode === 404

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          handleClose()
          return
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('qr.title')}</DialogTitle>
          <DialogDescription>{t('qr.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="qr-code">{t('qr.code.label')}</Label>
          <Input
            id="qr-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleResolve()
              }
            }}
            placeholder={t('qr.code.placeholder')}
          />
        </div>

        {notFound ? <p className="text-destructive text-xs">{t('qr.not-found')}</p> : null}
        {isError && !notFound ? (
          <p className="text-destructive text-xs">{t('qr.not-found')}</p>
        ) : null}
        {data ? (
          <p className="text-muted-foreground text-sm">{t('qr.resolved', { plate: data.plate })}</p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('qr.cancel')}
          </Button>
          <Button type="button" onClick={handleResolve} disabled={isPending || !code.trim()}>
            {isPending ? t('qr.resolving') : t('qr.resolve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
