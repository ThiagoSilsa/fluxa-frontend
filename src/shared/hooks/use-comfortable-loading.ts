import { useEffect, useRef, useState } from 'react'

/**
 * Piso de visibilidade do estado de carregamento.
 *
 * Garante que o skeleton/loading fique visível por pelo menos `minVisibleMs`
 * após ser disparado — evita o "piscar" quando a resposta chega rápido demais
 * (trocar esqueleto por conteúdo em ~40ms parece um flicker). Usado pelas
 * listagens compartilhadas (`EntityList`, `GenericTable`) para que o piso
 * viva em um só lugar.
 *
 * @param loading Estado cru de carregamento (da query).
 * @param minVisibleMs Duração mínima de visibilidade (default 300ms).
 * @returns `true` enquanto o carregamento deve ficar visível.
 */
export function useComfortableLoading(loading: boolean, minVisibleMs = 300): boolean {
  const [visible, setVisible] = useState(loading)
  const startRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (loading) {
      startRef.current = Date.now()
      setVisible(true)
      return
    }

    const elapsed = startRef.current === null ? 0 : Date.now() - startRef.current
    const remaining = Math.max(0, minVisibleMs - elapsed)
    timerRef.current = setTimeout(() => setVisible(false), remaining)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [loading, minVisibleMs])

  return visible
}
