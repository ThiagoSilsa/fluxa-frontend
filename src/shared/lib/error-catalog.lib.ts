/**
 * Geração do catálogo de códigos de erro do cliente (ADR 0001 §2).
 *
 * O catálogo (`src/shared/enum/api-error-key.ts`) não é escrito à mão: este
 * módulo lê o `fluxa-backend` e devolve o conteúdo do arquivo, que o script
 * `npm run errors:sync` grava. As três famílias de código que o servidor envia
 * (ADR 0016) saem de fontes diferentes:
 *
 * 1. **Mensagem de exceção** — o texto do primeiro argumento de um
 *    `new XxxException(...)`; o filtro global deriva o código dela no backend.
 * 2. **Mensagem de desfecho** — o texto das propriedades `message`,
 *    `denialMessage` e `blockRequestError` na portaria (`access`/`blocks`); são
 *    as respostas de resultado, que não passam pelo filtro e por isso derivam o
 *    código no próprio use case.
 * 3. **Código declarado** — a lista de erros de linha da importação
 *    (`IMPORT_ROW_ERROR_CODES`): o worker persiste o texto, então o código é
 *    declarado por ele (ADR 0016 §6).
 *
 * A derivação **não** é reimplementada aqui: ela é importada do backend
 * (`error-code.util.ts`), porque duas cópias da mesma regra foi justamente o que
 * este ciclo veio remover do cliente (ADR 0001 §3).
 *
 * O texto do arquivo é comparado com o que está commitado (`isCatalogStale`) —
 * é assim que o ticket de staleness cobra a ressincronização.
 */

// TypeScript
import ts from 'typescript'

/**
 * Arquivo do backend considerado na varredura.
 */
export interface BackendSource {
  /** Caminho absoluto do arquivo (só o `features/...` importa para as regras). */
  path: string
  /** Conteúdo do arquivo. */
  text: string
}

/**
 * Derivação de código usada na varredura — vem do backend, para não existir uma
 * segunda implementação da mesma regra.
 *
 * @param message Mensagem devolvida pelo servidor.
 * @returns Código derivado, ou `undefined` quando a mensagem não gera código.
 */
export type DeriveErrorCode = (message: string) => string | undefined

/**
 * Módulo do backend que declara o algoritmo de derivação — importado pelo script
 * em tempo de execução (a cópia no cliente saiu no ADR 0001 §3).
 */
export const BACKEND_DERIVER_MODULE = 'src/shared/utils/error-code.util.ts'

/** Export do módulo acima com a função de derivação. */
export const BACKEND_DERIVER_EXPORT = 'deriveErrorCode'

/** Módulo do backend que declara os códigos de linha da importação. */
export const BACKEND_IMPORT_ROW_MODULE =
  'src/features/imports/domain/constants/import-row-error.constant.ts'

/** Export do módulo acima com a lista de códigos de linha. */
export const BACKEND_IMPORT_ROW_EXPORT = 'IMPORT_ROW_ERROR_CODES'

/**
 * Sufixo das exceções cujo primeiro argumento é a mensagem do erro — é dele que
 * o filtro do backend deriva o código.
 */
const EXCEPTION_SUFFIX = 'Exception'

/**
 * Propriedades que carregam **texto de desfecho** (resposta de resultado): a
 * entrada registrada, o impedimento e o aviso de que o bloqueio não pôde ser
 * pedido.
 */
const TRANSITION_MESSAGE_PROPERTIES = ['message', 'denialMessage', 'blockRequestError']

/**
 * Onde vive o texto de desfecho: a portaria (`access`) e o registro de
 * impedimento com pedido de bloqueio (`blocks`). Fora dessas features, uma
 * propriedade `message` é outra coisa (descrição de Swagger, texto de
 * validação de DTO) e não vira código.
 */
const TRANSITION_SOURCE_PATTERN = /\/features\/(access|blocks)\//

/**
 * Lê um arquivo TypeScript em árvore sintática.
 *
 * @param path Caminho do arquivo — só serve de nome para a árvore.
 * @param text Conteúdo do arquivo.
 * @returns A árvore pronta para varredura.
 */
function parse(path: string, text: string): ts.SourceFile {
  return ts.createSourceFile(path, text, ts.ScriptTarget.ES2022, true)
}

/**
 * Todos os literais de texto de uma subárvore — usado no valor das propriedades
 * de desfecho, onde a mensagem pode vir de um `??` ou de um ternário (as duas
 * opções são mensagens e as duas precisam de tradução).
 *
 * @param node Nó a varrer.
 * @returns Os literais encontrados, na ordem do arquivo.
 */
function stringLiteralsIn(node: ts.Node): string[] {
  const found: string[] = []

  const visit = (current: ts.Node): void => {
    if (ts.isStringLiteral(current) || ts.isNoSubstitutionTemplateLiteral(current)) {
      found.push(current.text)
    }
    current.forEachChild(visit)
  }

  visit(node)

  return found
}

/**
 * Mensagens de erro e de desfecho de um arquivo do backend.
 *
 * Mensagem de exceção com interpolação (`\`Linha ${n} ...\``) é ignorada de
 * propósito: o código derivado dela mudaria a cada linha, e é exatamente por
 * isso que o erro de linha da importação é um código **declarado**.
 *
 * @param source Arquivo do backend.
 * @returns As mensagens encontradas, na ordem do arquivo.
 */
export function extractMessages(source: BackendSource): string[] {
  const file = parse(source.path, source.text)
  const messages: string[] = []
  const isTransitionSource = TRANSITION_SOURCE_PATTERN.test(source.path)

  const visit = (node: ts.Node): void => {
    if (ts.isNewExpression(node) && node.arguments !== undefined) {
      const callee = node.expression.getText(file)
      const first = node.arguments[0]

      if (
        callee.endsWith(EXCEPTION_SUFFIX) &&
        first !== undefined &&
        (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first))
      ) {
        messages.push(first.text)
      }
    }

    if (isTransitionSource && ts.isPropertyAssignment(node)) {
      const property = node.name.getText(file)

      if (TRANSITION_MESSAGE_PROPERTIES.includes(property)) {
        messages.push(...stringLiteralsIn(node.initializer))
      }
    }

    node.forEachChild(visit)
  }

  visit(file)

  return messages
}

/**
 * Códigos declarados num array de literais exportado pelo backend.
 *
 * @param source Arquivo do backend que declara a lista.
 * @param exportName Nome da constante exportada.
 * @returns Os códigos na ordem declarada.
 */
export function extractDeclaredCodes(source: BackendSource, exportName: string): string[] {
  const file = parse(source.path, source.text)

  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue
    }

    for (const declaration of statement.declarationList.declarations) {
      const declaresList = ts.isIdentifier(declaration.name) && declaration.name.text === exportName

      if (declaresList && declaration.initializer !== undefined) {
        return stringLiteralsIn(declaration.initializer)
      }
    }
  }

  throw new Error(`Export \`${exportName}\` não encontrado em ${source.path}.`)
}

/**
 * Catálogo completo, ordenado e sem repetição.
 *
 * A ordem é a de `Array#sort` (por ponto de código) — a mesma da lista que o
 * arquivo tinha quando era mantido à mão, para a revisão da mudança não virar
 * ruído de reordenação.
 *
 * @param sources Fontes do backend varridas.
 * @param derive Derivação de código do backend.
 * @param declaredCodes Códigos declarados pelo worker (erro de linha).
 * @returns Os códigos do catálogo.
 */
export function buildCatalog(
  sources: BackendSource[],
  derive: DeriveErrorCode,
  declaredCodes: string[],
): string[] {
  const codes = new Set<string>(declaredCodes)

  for (const source of sources) {
    for (const message of extractMessages(source)) {
      const code = derive(message)

      if (code !== undefined) {
        codes.add(code)
      }
    }
  }

  return [...codes].sort()
}

/**
 * Conteúdo do arquivo de catálogo.
 *
 * O arquivo tem as três partes que o cliente usa: a lista de códigos, o prefixo
 * das chaves de tradução (`errors.server.<CODIGO>`) e o mapa código → chave, que
 * sobrepõe as chaves **semânticas** (texto próprio, sem depender da mensagem do
 * servidor).
 *
 * @param codes Os códigos do catálogo, já ordenados.
 * @returns O arquivo inteiro, pronto para gravar.
 */
export function renderCatalogFile(codes: string[]): string {
  const list = codes.map((code) => `  '${code}',`).join('\n')

  return `/**
 * Geração automática — **não edite este arquivo à mão**.
 *
 * Rodar \`npm run errors:sync\` (que varre o \`fluxa-backend\`, caminho configurável
 * por \`ERROR_CATALOG_BACKEND\`) reescreve a lista abaixo, e o teste de staleness
 * reprova o arquivo que ficar para trás (ADR 0001 §2).
 *
 * Cada código é um valor que o backend envia na resposta (ADR 0016): código novo
 * só aparece aqui depois de rodar o script. Todo código desta lista precisa de
 * texto próprio em \`errors.server.<CODIGO>\` nos três idiomas — sem ele a
 * interface mostra o genérico e o teste de i18n fica vermelho.
 */
const SERVER_ERROR_CODES = [
${list}
]

/**
 * Prefixo das chaves de tradução dos códigos do backend
 * (\`errors.server.<CODIGO>\` — ver \`translateApiCodeError\`).
 */
export const API_ERROR_CODE_KEY_PREFIX = 'errors.server'

/**
 * Chave i18n do código enviado pelo backend.
 *
 * @param code Código devolvido em \`payload.code\`, no desfecho da entrada ou no
 * aviso de bloqueio do impedimento.
 * @returns Chave no conjunto comum (\`errors.server.<CODIGO>\`).
 */
export function apiErrorCodeTranslationKey(code: string): string {
  return \`\${API_ERROR_CODE_KEY_PREFIX}.\${code}\`
}

/**
 * Mapa código → chave de tradução.
 *
 * Os códigos do backend entram primeiro; as chaves **semânticas** vêm depois
 * (texto próprio, sem depender da mensagem do servidor) e por isso vencem —
 * \`CREDENCIAIS_INVALIDAS\`, por exemplo, usa \`errors.invalidCredentials\` no lugar
 * do texto do servidor.
 */
export const apiErrorKeyMap: Record<string, string> = {
  ...Object.fromEntries(SERVER_ERROR_CODES.map((code) => [code, apiErrorCodeTranslationKey(code)])),
  CREDENCIAIS_INVALIDAS: 'errors.invalidCredentials',
  VALIDATION_ERROR: 'errors.validation.generic',
  UNEXPECTED_ERROR: 'errors.unexpected',
}
`
}

/**
 * Diz se o arquivo commitado está para trás do que o backend produz.
 *
 * É o juiz do teste de staleness e o que o script usa para decidir se grava.
 *
 * @param committed Conteúdo do arquivo do repositório.
 * @param expected Conteúdo recém-gerado.
 * @returns `true` quando o arquivo precisa ser regerado.
 */
export function isCatalogStale(committed: string, expected: string): boolean {
  return committed !== expected
}
