export type ParsedImportError = {
  line: number
  message: string
}

/**
 * Extrai número da linha e mensagem de um `code` de erro no padrão
 * `LINHA_<linha>_<MENSAGEM>` (ADR 0007 §7).
 *
 * @param code Código de erro vindo da API.
 * @returns `{ line, message }` ou `null` se não for erro por linha.
 */
export function parseImportError(code: string): ParsedImportError | null {
  const match = code.match(/^LINHA_(\d+)_(.+)$/)
  if (!match) {
    return null
  }

  return {
    line: Number(match[1]),
    message: match[2],
  }
}
