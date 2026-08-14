/**
 * Iniciais de um nome, para avatares.
 *
 * Até duas iniciais: a primeira palavra e a última. Nomes com uma palavra só
 * devolvem a inicial dela. Nomes vazios (ou só espaços) devolvem string vazia.
 *
 * @param name Nome completo.
 * @returns Iniciais em maiúsculas.
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return ''

  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''

  return `${first}${last}`.toUpperCase()
}
