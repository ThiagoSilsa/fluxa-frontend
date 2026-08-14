// React
import { useEffect, useState } from 'react'

/**
 * Retorna o valor com atualização atrasada (debounce).
 *
 * Útil para buscas e filtros que disparam chamadas caras (ex.: busca de
 * páginas na sidebar): o valor só muda depois de `delayMs` sem novas
 * alterações.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)

    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
