// Components
import { Button } from '#/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/shared/components/ui/dialog'

// Hooks
import { useStableWhileClosing } from '#/shared/hooks/use-stable-while-closing'

export type ConfirmDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Titulo do dialog. */
  title: string
  /** Descricao do dialog. */
  description: string
  /** Rotulo do botao de confirmar. */
  confirmLabel: string
  /** Rotulo do botao de cancelar. */
  cancelLabel: string
  /** Callback ao confirmar. */
  onConfirm: () => void
  /** Se true, desabilita os botoes enquanto a acao esta pendente. */
  isPending?: boolean
  /** Estilo do botao de confirmar. @default 'destructive' */
  variant?: 'default' | 'destructive'
}

/**
 * Dialog de confirmacao (ex.: desativar cargo, excluir registro).
 * Estabiliza o shell visual durante a animacao de fechamento (mesmo padrao do
 * FormDialog).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  isPending = false,
  variant = 'destructive',
}: ConfirmDialogProps) {
  const stableTitle = useStableWhileClosing(title, open)
  const stableDescription = useStableWhileClosing(description, open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{stableTitle}</DialogTitle>
          <DialogDescription>{stableDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={() => {
              onConfirm()
            }}
            disabled={isPending}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
