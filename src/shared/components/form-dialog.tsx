import type { ReactNode } from 'react'

// Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/shared/components/ui/dialog'

// Hooks
import { useStableWhileClosing } from '#/shared/hooks/use-stable-while-closing'

// Utils
import { cn } from '#/shared/lib/utils'

export type DialogSize =
  'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'

const dialogSizeMap: Record<DialogSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
  '6xl': 'sm:max-w-6xl',
  '7xl': 'sm:max-w-7xl',
  full: 'sm:max-w-full',
}

export type FormDialogProps = {
  /** Controla a abertura do dialog. */
  open: boolean
  /** Callback ao alterar o estado de abertura. */
  onOpenChange: (open: boolean) => void
  /** Titulo do dialog. */
  title: string
  /** Descricao do dialog. */
  description: string
  /** Conteudo do formulario. */
  children: ReactNode
  /** Tamanho do modal. @default 'lg' */
  size?: DialogSize
  /**
   * Se true, o modal tera altura fixa de 85dvh, independente do conteudo.
   * Util para formularios com abas que mudam de tamanho, evitando que o modal
   * "pule" de altura ao trocar de aba.
   *
   * Quando false, o modal cresce com o conteudo ate o limite de 85dvh. Em ambos
   * os casos o excedente rola no scroll interno.
   * @default false
   */
  fixedHeight?: boolean
}

/**
 * Dialog generico para formularios de criacao/edicao.
 * Fornece o wrapper com header, titulo e descricao,
 * enquanto o conteudo do formulario e injetado via children.
 *
 * O titulo, a descricao e o conteudo sao congelados (estabilizados por ref)
 * durante a animacao de fechamento para evitar flicker visual causado pela
 * alteracao dessas props pelo componente pai — que tipicamente zera o estado do
 * formulario no mesmo instante em que fecha o dialog, o que faria o conteudo
 * esvaziar/remontar enquanto o modal ainda esta visivel.
 *
 * @example
 * <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Criar" description="...">
 *   <RoleForm onSubmit={handleSubmit} ... />
 * </FormDialog>
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'lg',
  fixedHeight = false,
}: FormDialogProps) {
  // Estabiliza todo o shell visual (titulo, descricao, conteudo e dimensoes)
  // durante a animacao de fechamento — ver useStableWhileClosing.
  const stableTitle = useStableWhileClosing(title, open)
  const stableDescription = useStableWhileClosing(description, open)
  const stableChildren = useStableWhileClosing(children, open)
  const stableSize = useStableWhileClosing(size, open)
  const stableFixedHeight = useStableWhileClosing(fixedHeight, open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex flex-col overflow-y-auto',
          dialogSizeMap[stableSize],
          // Teto de 85dvh nos dois casos: garante respiro nas bordas da viewport
          // e mantem o excedente acessivel pelo scroll interno.
          stableFixedHeight ? 'h-[85dvh]' : 'max-h-[85dvh]',
        )}
      >
        <DialogHeader>
          <DialogTitle>{stableTitle}</DialogTitle>
          <DialogDescription>{stableDescription}</DialogDescription>
        </DialogHeader>
        {stableChildren}
      </DialogContent>
    </Dialog>
  )
}
