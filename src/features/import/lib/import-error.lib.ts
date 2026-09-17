// Enum
import { apiErrorKeyMap } from '#/shared/enum/api-error-key'

// Types
import type { ImportJobErrorInput, ImportJobErrorText } from '../types/import.types'

/**
 * Namespace onde vivem os textos de reserva do erro de importação.
 *
 * As chaves deste namespace saem **sem** prefixo (quem exibe traduz com o `t` do
 * `import`); a chave do código do servidor sai qualificada com o conjunto comum,
 * porque é lá que o catálogo gerado aponta (ADR 0001 §2/§4).
 */
const IMPORT_NAMESPACE = 'import'

/** Reserva quando o código tem tradução mas o job não trouxe parâmetros. */
const GENERIC_KEY = `${IMPORT_NAMESPACE}:detail.error-generic`

/** Reserva quando dá para dizer a linha, mas não a regra. */
const GENERIC_LINE_KEY = `${IMPORT_NAMESPACE}:detail.error-line`

/**
 * Linha extraída da mensagem que ficou gravada em jobs **antigos**
 * (`Linha 3: …`, em português, ou no idioma do log).
 *
 * O texto não é exibido — só o número sai dele, para o aviso genérico ainda
 * dizer onde a planilha parou (ADR 0001 §6).
 */
const LEGACY_LINE_PATTERN = /(?:linha|línea|line)\s+(\d+)/i

/**
 * Lê o número da linha de um job antigo a partir da mensagem persistida.
 *
 * @param message Texto gravado pelo servidor (nunca exibido).
 * @returns O número da linha, ou `null` quando a mensagem não o traz.
 */
function readLegacyLine(message: string | null): number | null {
  const match = message ? LEGACY_LINE_PATTERN.exec(message) : null

  return match ? Number(match[1]) : null
}

/**
 * Texto do erro de um job de importação, a partir do **código** e dos
 * **parâmetros** que o job guardou (ADR 0016 §6).
 *
 * Em ordem de preferência:
 *
 * 1. código com tradução no catálogo gerado → o texto da regra, já com a linha
 *    interpolada (`Linha 3: name deve ter entre 2 e 255 caracteres.`);
 * 2. código sem tradução, ou job antigo sem código, mas com a linha disponível →
 *    o aviso genérico com o número da linha;
 * 3. nada disso → o genérico do idioma ativo.
 *
 * O texto em português gravado pelo servidor **nunca** é exibido: no job antigo
 * ele serve só para recuperar o número da linha (ADR 0001 §1).
 *
 * @param job Campos do erro do job (código, parâmetros e mensagem).
 * @returns A chave i18n (qualificada quando é do conjunto comum) com os
 * parâmetros do texto, ou `null` quando o job não tem erro.
 */
export function resolveImportJobError(job: ImportJobErrorInput): ImportJobErrorText | null {
  const key = job.errorCode ? apiErrorKeyMap[job.errorCode] : undefined

  if (key) {
    return { key: `common:${key}`, params: job.errorParams ?? {} }
  }

  const line = job.errorParams?.line ?? readLegacyLine(job.errorMessage)

  if (line !== undefined && line !== null) {
    return { key: GENERIC_LINE_KEY, params: { line } }
  }

  const hasError = Boolean(job.errorCode ?? job.errorMessage ?? job.errorParams)

  return hasError ? { key: GENERIC_KEY, params: {} } : null
}
