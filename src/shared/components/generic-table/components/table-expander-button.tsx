// Icons
import { ChevronDown, ChevronRight } from 'lucide-react'

// Shared
import { Button } from '#/shared/components/ui/button'

export type TableExpanderButtonProps = {
  /** Linha estável que este botão controla. */
  rowKey: string
  /** A linha está expandida? */
  isExpanded: boolean
  /** Alterna a expansão. */
  onToggle: (rowKey: string) => void
  /** Rótulos acessíveis (i18n do consumidor). */
  labels: { expand: string; collapse: string }
  /** `id` do conteúdo expandido (usado no `aria-controls`). */
  controlsId: string
}

/**
 * Botão de expandir/recolher a linha (primeira coluna das tabelas
 * expansíveis).
 */
export function TableExpanderButton({
  rowKey,
  isExpanded,
  onToggle,
  labels,
  controlsId,
}: TableExpanderButtonProps) {
  const label = isExpanded ? labels.collapse : labels.expand

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-6"
      aria-label={label}
      aria-expanded={isExpanded}
      aria-controls={isExpanded ? controlsId : undefined}
      onClick={(event) => {
        // A linha inteira pode alternar a expansão: o clique aqui não deve
        // disparar o handler da linha (e, se houver `onRowClick`, não pode
        // abrir a ação da tela).
        event.stopPropagation()
        onToggle(rowKey)
      }}
    >
      {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
    </Button>
  )
}
