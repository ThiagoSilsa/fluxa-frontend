// React
import { useEffect } from 'react'

/**
 * Termina a restauração de rolagem que o roteador começa.
 *
 * O roteador (TanStack Router, com `scrollRestoration`) restaura a posição de
 * rolagem no instante em que a nova página monta — mas aí ela ainda não tem
 * altura, e o navegador descarta o comando. Esperar um frame e rolar de novo
 * garante que a página nova abra no topo.
 *
 * Fica aqui, no layout, e não numa página: vale para todas.
 *
 * TODO: Revisar quando houver navegação com restauração de posição (ex.:
 * voltar para listas longas) — versão mínima recriada (original do outro repo
 * não estava disponível).
 */
export function ScrollRestorationSettler() {
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })

    return () => cancelAnimationFrame(raf)
  }, [])

  return null
}
