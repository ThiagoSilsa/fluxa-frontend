// Vitest
import { describe, expect, it } from 'vitest'

// i18n
import i18n from './index'

// Lib
import { APP_LANGUAGES } from '#/shared/lib/language.lib'

/**
 * Guarda de registro dos arquivos de tradução.
 *
 * Um namespace some do `index.ts` sem que nada acuse: o i18next devolve a
 * própria chave quando não encontra o namespace, então `tsc`, `lint` e os
 * testes de componente seguem verdes enquanto a tela mostra `page.title`.
 * Foi assim que a aba de Disparos ficou inteira em chaves cruas — as cinco
 * linhas do registro se perderam numa resolução de conflito.
 *
 * A conferência é por **conteúdo**, e não por caminho: o nome do namespace
 * não é derivável do diretório (`work-schedule-editor` → `workSchedule`,
 * `whatsapp-integration-warning` → `whatsappIntegration`), e uma regra de
 * nome seria mais frágil que o defeito que ela evita.
 */
describe('registro dos arquivos de tradução', () => {
  const files = import.meta.glob('/src/**/i18n/*.json', {
    eager: true,
    import: 'default',
  })

  /** Arquivos de um idioma, como pares `[caminho, conteúdo]`. */
  const filesOf = (language: string) =>
    Object.entries(files).filter(([path]) => path.endsWith(`/${language}.json`))

  /** Bundles registrados para o idioma (namespace → conteúdo). */
  const bundlesOf = (language: string): Record<string, unknown> => i18n.store.data[language] ?? {}

  /** Bundles que o i18next tem em memória para o idioma. */
  const registeredOf = (language: string) => new Set<unknown>(Object.values(bundlesOf(language)))

  /**
   * Chaves folha de um bundle, em caminho pontuado (`a.b.c`).
   *
   * Comparar chave a chave é o que pega o defeito que a revisão manual não
   * pega: a tela nova entra em pt/en e o idioma novo fica sem as chaves dela,
   * caindo no idioma de fallback em silêncio.
   */
  const leafKeys = (value: unknown, prefix = ''): string[] => {
    if (value === null || typeof value !== 'object') {
      return [prefix]
    }

    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      leafKeys(child, prefix ? `${prefix}.${key}` : key),
    )
  }

  it.each(APP_LANGUAGES)('todo arquivo de tradução em %s está registrado', (language) => {
    const registered = registeredOf(language)

    const orphans = filesOf(language)
      .filter(([, content]) => registered.has(content) === false)
      .map(([path]) => path)

    // O caminho do órfão vai na mensagem: sem ele o retorno é só "1 !== 0" e
    // quem lê tem de sair procurando qual arquivo ficou de fora.
    expect(orphans, `não registrados em src/i18n/index.ts:\n${orphans.join('\n')}`).toEqual([])
  })

  it('nenhum idioma registra um namespace que a referência não tem', () => {
    // Namespace a mais é sinal de nome trocado no registro (o componente pede
    // um nome que não existe e mostra a chave crua).
    const [reference, ...others] = APP_LANGUAGES
    const expected = Object.keys(bundlesOf(reference)).sort()

    others.forEach((language) => {
      const extra = Object.keys(bundlesOf(language)).filter(
        (namespace) => expected.includes(namespace) === false,
      )
      expect(extra, `namespaces que só existem em ${language}`).toEqual([])
    })
  })

  it('todo idioma tem as mesmas chaves da referência, em cada namespace', () => {
    // A paridade é conferida por namespace (e não no conjunto achatado): a
    // mesma chave em dois namespaces é outro defeito, e não tradução faltando.
    const [reference, ...others] = APP_LANGUAGES
    const expected = bundlesOf(reference)

    const problems: string[] = []

    others.forEach((language) => {
      const bundles = bundlesOf(language)

      Object.entries(expected).forEach(([namespace, content]) => {
        const translated = bundles[namespace]

        // Namespace ausente é a forma mais grave de tradução faltando: a tela
        // inteira cai no idioma de fallback sem que nada acuse.
        if (translated === undefined) {
          problems.push(`${namespace} (${language}): namespace não registrado`)
          return
        }

        const referenceKeys = leafKeys(content)
        const translatedKeys = new Set(leafKeys(translated))

        const missing = referenceKeys.filter((key) => translatedKeys.has(key) === false)
        const extra = [...translatedKeys].filter((key) => referenceKeys.includes(key) === false)

        if (missing.length > 0 || extra.length > 0) {
          problems.push(
            `${namespace} (${language}): falta [${missing.join(', ')}] sobra [${extra.join(', ')}]`,
          )
        }
      })
    })

    expect(problems, problems.join('\n')).toEqual([])
  })

  it('o núcleo resolve em espanhol (e não no idioma de fallback)', async () => {
    // Prova o caminho inteiro do idioma novo num punhado de telas: se o bundle
    // não estivesse registrado, o i18next devolveria a própria chave.
    await i18n.changeLanguage('es')

    expect(i18n.t('notFound.title')).toBe('Página no encontrada')
    expect(i18n.t('pagination.next')).toBe('Página siguiente')
    expect(i18n.t('page.title', { ns: 'login' })).toBe('Iniciar sesión')
    expect(i18n.t('sidebar.items.portaria', { ns: 'mainLayout' })).toBe('Portería')
    expect(i18n.t('languages.es', { ns: 'languageSelector' })).toBe('Español')
  })
})
