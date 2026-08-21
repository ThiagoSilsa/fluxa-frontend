// React
import { useState } from 'react'

// Icons
import { Check, Copy } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { DeviceTokenTarget } from '../types/devices.types'

// Components
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '#/shared/components'

export type DeviceTokenDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Token recém-gerado (criação/rotação) + dispositivo. */
  target: DeviceTokenTarget
}

/**
 * Dialog de exibição do token de sincronização — **write-only** (ADR 0008 §3):
 * o token é exibido uma única vez (criação/rotação) com aviso para guardá-lo.
 *
 * O token identifica o aparelho na sincronização (semana 3+); não é possível
 * recuperá-lo depois — rotacionar gera um novo.
 */
export function DeviceTokenDialog({ open, onOpenChange, target }: DeviceTokenDialogProps) {
  const { t } = useTranslation('devices')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(target.token)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard indisponível — o usuário pode copiar manualmente do input.
      setCopied(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('token.title')}</DialogTitle>
          <DialogDescription>
            {t('token.description', { name: target.device.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            readOnly
            value={target.token}
            className="font-mono"
            aria-label={t('token.label')}
          />
          <p className="text-muted-foreground text-xs">{t('token.warning')}</p>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('token.close')}
          </Button>
          <Button type="button" onClick={handleCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? t('token.copied') : t('token.copy')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
