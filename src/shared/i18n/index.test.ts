// Vitest
import { describe, expect, it } from 'vitest'

// i18n
import i18n from './index'

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

  /** Bundles que o i18next tem em memória para o idioma. */
  const registeredOf = (language: string) =>
    new Set<unknown>(Object.values(i18n.store.data[language] ?? {}))

  it.each(['pt', 'en'])('todo arquivo de tradução em %s está registrado', (language) => {
    const registered = registeredOf(language)

    const orphans = filesOf(language)
      .filter(([, content]) => !registered.has(content))
      .map(([path]) => path)

    // O caminho do órfão vai na mensagem: sem ele o retorno é só "1 !== 0" e
    // quem lê tem de sair procurando qual arquivo ficou de fora.
    expect(orphans, `não registrados em src/i18n/index.ts:\n${orphans.join('\n')}`).toEqual([])
  })

  it('pt e en registram exatamente os mesmos namespaces', () => {
    // Registrar num idioma só não quebra a tela — o `fallbackLng` cobre. Quebra
    // o outro idioma, em silêncio, pelo mesmo descuido do registro faltando.
    expect(Object.keys(i18n.store.data.pt ?? {}).sort()).toEqual(
      Object.keys(i18n.store.data.en ?? {}).sort(),
    )
  })
})
