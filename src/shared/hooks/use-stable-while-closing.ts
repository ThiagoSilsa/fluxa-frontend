import { useEffect, useRef, useState } from 'react'

/**
 * Estabiliza um valor durante a animação de fechamento de um dialog.
 *
 * Enquanto `open` é `true`, devolve o valor vivo (o pai pode atualizá-lo —
 * ex.: campos do formulário). Quando o dialog começa a fechar (`open` vira
 * `false`), congela o último valor por `closingMs`, para o conteúdo não
 * esvaziar/remontar enquanto o modal ainda está visível na animação de saída.
 *
 * @param value Valor a estabilizar (título, descrição, children, etc.).
 * @param open Estado de abertura do dialog.
 * @param closingMs Duração da animação de fechamento (default 200ms).
 * @returns Valor estável durante o fechamento.
 */
export function useStableWhileClosing<T>(value: T, open: boolean, closingMs = 200): T {
  const [stable, setStable] = useState(value)
  const closingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      closingRef.current = false
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      setStable(value)
      return
    }

    if (!closingRef.current) {
      closingRef.current = true
      timerRef.current = setTimeout(() => {
        closingRef.current = false
        setStable(value)
      }, closingMs)
    }
  }, [value, open, closingMs])

  return stable
}
