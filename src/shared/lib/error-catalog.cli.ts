/**
 * Script `npm run errors:sync` — regera o catálogo de códigos do cliente a partir
 * do `fluxa-backend` (ADR 0001 §2).
 *
 * Uso:
 *
 * ```bash
 * npm run errors:sync                    # grava o catálogo
 * npm run errors:sync -- --check         # só confere (falha quando desatualizado)
 * npm run errors:sync -- --backend=/caminho/para/fluxa-backend
 * ```
 *
 * O caminho do backend sai de `--backend`, senão de `ERROR_CATALOG_BACKEND`,
 * senão do irmão `../fluxa-backend` — o layout dos dois repositórios.
 *
 * A derivação das mensagens **não** é reimplementada aqui: o módulo do backend é
 * importado em tempo de execução (`error-code.util.ts`), para não existirem duas
 * regras para a mesma coisa (ADR 0001 §3).
 */

// Node
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Lib
import {
  BACKEND_DERIVER_EXPORT,
  BACKEND_DERIVER_MODULE,
  BACKEND_IMPORT_ROW_EXPORT,
  BACKEND_IMPORT_ROW_MODULE,
  buildCatalog,
  extractDeclaredCodes,
  isCatalogStale,
  renderCatalogFile,
} from './error-catalog.lib.ts'
import type { BackendSource, DeriveErrorCode } from './error-catalog.lib.ts'

/** Arquivo gerado — o destino do script. */
const CATALOG_FILE = fileURLToPath(new URL('../enum/api-error-key.ts', import.meta.url))

/** Raiz do `fluxa-frontend` (o script mora em `src/shared/lib/`). */
const FRONTEND_ROOT = fileURLToPath(new URL('../../../', import.meta.url))

/** Backend usado quando nada é informado. */
const DEFAULT_BACKEND_ROOT = resolve(FRONTEND_ROOT, '..', 'fluxa-backend')

/**
 * Conteúdo de um arquivo, ou `null` quando ele não existe.
 *
 * @param path Caminho do arquivo.
 * @returns O texto do arquivo, ou `null`.
 */
function readOptional(path: string): string | null {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return null
  }
}

/**
 * Fontes do backend que entram na varredura: todo `.ts` de `src`, menos os
 * testes (mensagem de teste não é contrato de resposta).
 *
 * @param backendRoot Raiz do `fluxa-backend`.
 * @returns Os arquivos a varrer.
 */
function readBackendSources(backendRoot: string): BackendSource[] {
  const srcRoot = join(backendRoot, 'src')
  const entries = readdirSync(srcRoot, { recursive: true, withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
    .filter((entry) => !/\.(spec|test)\.ts$/.test(entry.name))
    .map((entry) => {
      const path = join(entry.parentPath, entry.name)

      return { path, text: readFileSync(path, 'utf8') }
    })
}

/**
 * Importa a derivação de código do backend.
 *
 * O caminho é dinâmico (o backend é configurável), então o carregador não pode
 * resolvê-lo em tempo de build — daí o `@vite-ignore`.
 *
 * @param backendRoot Raiz do `fluxa-backend`.
 * @returns A função de derivação do backend.
 */
async function loadBackendDeriver(backendRoot: string): Promise<DeriveErrorCode> {
  const href = pathToFileURL(join(backendRoot, BACKEND_DERIVER_MODULE)).href
  const module = (await import(/* @vite-ignore */ href)) as Record<string, unknown>
  const derive = module[BACKEND_DERIVER_EXPORT]

  if (typeof derive !== 'function') {
    throw new Error(`${BACKEND_DERIVER_MODULE} não exporta ${BACKEND_DERIVER_EXPORT}.`)
  }

  return derive as DeriveErrorCode
}

/**
 * Lê os códigos de linha da importação declarados pelo worker.
 *
 * @param backendRoot Raiz do `fluxa-backend`.
 * @returns Os códigos declarados.
 */
function readImportRowCodes(backendRoot: string): string[] {
  const path = join(backendRoot, BACKEND_IMPORT_ROW_MODULE)
  const text = readOptional(path)

  if (text === null) {
    throw new Error(`Módulo de códigos de linha não encontrado: ${path}.`)
  }

  return extractDeclaredCodes({ path, text }, BACKEND_IMPORT_ROW_EXPORT)
}

/**
 * Caminho do backend: argumento, variável de ambiente, ou o repositório irmão.
 *
 * @param argv Argumentos da linha de comando.
 * @returns A raiz do `fluxa-backend`.
 */
export function resolveBackendRoot(argv: string[]): string {
  const fromArgument = argv.find((argument) => argument.startsWith('--backend='))

  return (
    fromArgument?.slice('--backend='.length) ??
    process.env.ERROR_CATALOG_BACKEND ??
    DEFAULT_BACKEND_ROOT
  )
}

/**
 * Gera o catálogo e decide o que fazer com ele.
 *
 * @param argv Argumentos da linha de comando (sem `node` e sem o script).
 * @returns O código de saída do processo.
 */
export async function run(argv: string[]): Promise<number> {
  const backendRoot = resolveBackendRoot(argv)
  const checkOnly = argv.includes('--check')

  const derive = await loadBackendDeriver(backendRoot)
  const codes = buildCatalog(
    readBackendSources(backendRoot),
    derive,
    readImportRowCodes(backendRoot),
  )
  const expected = renderCatalogFile(codes)
  const committed = readOptional(CATALOG_FILE) ?? ''

  if (!isCatalogStale(committed, expected)) {
    process.stdout.write(`Catálogo atualizado — ${codes.length} códigos.\n`)

    return 0
  }

  if (checkOnly) {
    process.stderr.write(
      'Catálogo de códigos desatualizado em relação ao fluxa-backend.\n' +
        'Rode `npm run errors:sync` e traduza os códigos novos.\n',
    )

    return 1
  }

  writeFileSync(CATALOG_FILE, expected)
  process.stdout.write(`Catálogo regerado — ${codes.length} códigos.\n`)

  return 0
}

const invokedPath = process.argv[1]

if (invokedPath !== undefined && import.meta.url === pathToFileURL(invokedPath).href) {
  process.exitCode = await run(process.argv.slice(2))
}
