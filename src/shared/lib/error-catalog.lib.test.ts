// @vitest-environment node
// O gerador lê arquivos do `fluxa-backend` e importa a derivação de lá: o
// ambiente precisa ser o do Node, não o jsdom dos testes de componente.

// Vitest
import { describe, expect, it, vi } from 'vitest'

// Node
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

// Lib
import {
  buildCatalog,
  extractDeclaredCodes,
  extractMessages,
  isCatalogStale,
  renderCatalogFile,
} from './error-catalog.lib'
import { resolveBackendRoot, run } from './error-catalog.cli'

/** Monta um arquivo do backend a partir das linhas (mantém o teste legível). */
function source(path: string, ...lines: string[]) {
  return { path, text: lines.join('\n') }
}

const ACCESS_USE_CASE =
  '/backend/src/features/access/application/use-cases/register-entry.use-case.ts'
const BLOCKS_USE_CASE =
  '/backend/src/features/blocks/application/use-cases/register-entry-denial.use-case.ts'
const DEVICES_USE_CASE = '/backend/src/features/devices/application/use-cases/x.use-case.ts'

describe('extractMessages', () => {
  it('pega a mensagem literal do primeiro argumento de uma exceção', () => {
    expect(
      extractMessages(
        source(DEVICES_USE_CASE, `throw new NotFoundException('Dispositivo não encontrado.')`),
      ),
    ).toEqual(['Dispositivo não encontrado.'])

    expect(
      extractMessages(
        source(DEVICES_USE_CASE, 'throw new ConflictException(', `  'Placa já cadastrada.',`, ')'),
      ),
    ).toEqual(['Placa já cadastrada.'])
  })

  it('ignora mensagem interpolada (o código mudaria a cada linha)', () => {
    expect(
      extractMessages(
        source(DEVICES_USE_CASE, 'throw new BadRequestException(`Linha ${line}: inválida.`)'),
      ),
    ).toEqual([])
  })

  it('ignora exceção cujo primeiro argumento não é texto', () => {
    expect(
      extractMessages(
        source(DEVICES_USE_CASE, `throw new NotFoundException({ message: 'X', code: 'Y' })`),
      ),
    ).toEqual([])
  })

  it('pega as mensagens de desfecho da portaria (message e denialMessage)', () => {
    expect(
      extractMessages(
        source(
          ACCESS_USE_CASE,
          'return this.toEntryResponse({',
          '  granted: true,',
          `  message: input.request ? 'Entrada registrada com solicitação.' : 'Entrada registrada.',`,
          '})',
          'return { allowed: false, denialMessage: "Condutor não autorizado." }',
        ),
      ),
    ).toEqual([
      'Entrada registrada com solicitação.',
      'Entrada registrada.',
      'Condutor não autorizado.',
    ])
  })

  it('pega o aviso de bloqueio do impedimento (blocks)', () => {
    expect(
      extractMessages(
        source(BLOCKS_USE_CASE, `return { blockRequest: null, blockRequestError: "Já existe." }`),
      ),
    ).toEqual(['Já existe.'])
  })

  it('não confunde `message` fora da portaria com mensagem de desfecho', () => {
    expect(
      extractMessages(
        source(DEVICES_USE_CASE, `const doc = { summary: 'X', message: 'Não é desfecho.' }`),
      ),
    ).toEqual([])
  })
})

describe('extractDeclaredCodes', () => {
  it('lê os códigos declarados de um array exportado', () => {
    expect(
      extractDeclaredCodes(
        source(
          '/backend/src/features/imports/domain/constants/import-row-error.constant.ts',
          'export const IMPORT_ROW_ERROR_CODES = [',
          `  'NAME_LENGTH',`,
          `  'SPREADSHEET_EMPTY',`,
          '] as const',
        ),
        'IMPORT_ROW_ERROR_CODES',
      ),
    ).toEqual(['NAME_LENGTH', 'SPREADSHEET_EMPTY'])
  })

  it('falha quando a constante não existe (backend fora do contrato)', () => {
    expect(() =>
      extractDeclaredCodes(source('/backend/src/constants.ts', 'export const OTHER = []'), 'X'),
    ).toThrowError(/não encontrado/)
  })
})

describe('buildCatalog', () => {
  const derive = (message: string) => message.toUpperCase().replace(/\./g, '').replace(/ /g, '_')

  it('junta mensagens derivadas e códigos declarados, sem repetir e ordenado', () => {
    const catalog = buildCatalog(
      [
        source(DEVICES_USE_CASE, `throw new NotFoundException('Veiculo nao encontrado.')`),
        source(ACCESS_USE_CASE, `return { granted: true, message: 'Veiculo nao encontrado.' }`),
      ],
      derive,
      ['NAME_LENGTH'],
    )

    expect(catalog).toEqual(['NAME_LENGTH', 'VEICULO_NAO_ENCONTRADO'])
  })

  it('ignora mensagem que não gera código', () => {
    const sources = [source(DEVICES_USE_CASE, `throw new Error('sem derivacao')`)]

    expect(buildCatalog(sources, () => undefined, [])).toEqual([])
  })
})

describe('renderCatalogFile', () => {
  const rendered = renderCatalogFile(['B', 'A'])

  it('marca o arquivo como gerado', () => {
    expect(rendered).toContain('não edite este arquivo à mão')
    expect(rendered).toContain('npm run errors:sync')
  })

  it('lista os códigos na ordem recebida', () => {
    expect(rendered).toContain("const SERVER_ERROR_CODES = [\n  'B',\n  'A',\n]")
  })

  it('mantém o prefixo e as chaves semânticas do mapa', () => {
    expect(rendered).toContain(`export const API_ERROR_CODE_KEY_PREFIX = 'errors.server'`)
    expect(rendered).toContain(`CREDENCIAIS_INVALIDAS: 'errors.invalidCredentials'`)
    expect(rendered).toContain(`VALIDATION_ERROR: 'errors.validation.generic'`)
    expect(rendered).toContain(`UNEXPECTED_ERROR: 'errors.unexpected'`)
  })
})

describe('isCatalogStale', () => {
  it('arquivo igual não está desatualizado', () => {
    expect(isCatalogStale(renderCatalogFile(['A']), renderCatalogFile(['A']))).toBe(false)
  })

  it('arquivo diferente está desatualizado', () => {
    expect(isCatalogStale(renderCatalogFile(['A']), renderCatalogFile(['A', 'B']))).toBe(true)
  })
})

describe('geração contra o fluxa-backend', () => {
  const backendRoot = resolveBackendRoot([])
  const backendAvailable = existsSync(join(backendRoot, 'src'))

  if (!backendAvailable) {
    // Mensagem explícita: quem roda este repositório sozinho precisa saber que a
    // conferência do catálogo não aconteceu (e como habilitá-la).
    console.warn(
      `Catálogo de códigos: fluxa-backend não encontrado em ${backendRoot} — ` +
        'teste de staleness pulado (aponte ERROR_CATALOG_BACKEND para habilitá-lo).',
    )
  }

  it.skipIf(!backendAvailable)('o catálogo commitado está atualizado', async () => {
    await expect(run(['--check'])).resolves.toBe(0)
  })
})

describe('run', () => {
  /** Backend de mentira: só o suficiente para o script percorrer as três fontes. */
  function buildFixtureBackend(): string {
    const root = mkdtempSync(join(tmpdir(), 'fluxa-backend-'))

    const module = (path: string, content: string) => {
      const target = join(root, path)

      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, content)
    }

    module(
      'src/shared/utils/error-code.util.ts',
      [
        'export function deriveErrorCode(message: string): string | undefined {',
        '  return message.toUpperCase().replace(/[^A-Z0-9]+/g, "_")',
        '}',
      ].join('\n'),
    )
    module(
      'src/features/imports/domain/constants/import-row-error.constant.ts',
      'export const IMPORT_ROW_ERROR_CODES = ["CODIGO_DECLARADO_DE_FIXTURE"] as const',
    )
    module(
      'src/features/devices/application/use-cases/throw.ts',
      "throw new NotFoundException('Mensagem de fixture.')",
    )

    return root
  }

  it('reprova o catálogo desatualizado, lendo o backend indicado', async () => {
    const root = buildFixtureBackend()
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)

    // A fixture não tem nada a ver com o catálogo commitado: `--check` reprova
    // (e não toca no arquivo do repositório).
    await expect(run(['--check', `--backend=${root}`])).resolves.toBe(1)
    expect(String(stderr.mock.calls[0]?.[0])).toContain('npm run errors:sync')

    stderr.mockRestore()
    rmSync(root, { recursive: true, force: true })
  })
})
