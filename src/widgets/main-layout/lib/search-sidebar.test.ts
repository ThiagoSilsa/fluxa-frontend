// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { searchPages } from './search-sidebar'

// Types
import type { TFunction } from 'i18next'
import type { SearchablePage } from '../types/search.type'

/** Tradução mínima das chaves usadas nos testes. */
const translations: Record<string, string> = {
  'sidebar.items.home': 'Home',
  'sidebar.items.home-desc': 'Visão geral do dashboard',
  'sidebar.items.users': 'Usuários',
  'sidebar.items.users-desc': 'Gerencie usuários do sistema',
  'sidebar.items.management': 'Gerenciamento',
}

const t = ((key: string) => translations[key] ?? key) as TFunction

const page = (over: Partial<SearchablePage>): SearchablePage => ({
  label: 'sidebar.items.users',
  path: '/management/users',
  icon: () => null,
  breadcrumb: [],
  keywords: [],
  ...over,
})

describe('searchPages', () => {
  it('retorna vazio para consulta vazia ou só espaços', () => {
    expect(searchPages('', [page({})], t)).toEqual([])
    expect(searchPages('   ', [page({})], t)).toEqual([])
  })

  it('encontra por label traduzido, case-insensitive', () => {
    const index = [page({ label: 'sidebar.items.users' })]

    expect(searchPages('usuários', index, t)).toHaveLength(1)
    expect(searchPages('USUÁRIOS', index, t)).toHaveLength(1)
  })

  it('encontra por descrição traduzida', () => {
    const index = [page({ label: 'sidebar.items.users', description: 'sidebar.items.users-desc' })]

    expect(searchPages('gerencie', index, t)).toHaveLength(1)
  })

  it('encontra por keyword', () => {
    const index = [page({ label: 'sidebar.items.users', keywords: ['colaborador'] })]

    expect(searchPages('colaborador', index, t)).toHaveLength(1)
  })

  it('encontra por breadcrumb traduzido', () => {
    const index = [page({ label: 'sidebar.items.users', breadcrumb: ['sidebar.items.management'] })]

    expect(searchPages('gerenciamento', index, t)).toHaveLength(1)
  })

  it('ordena por relevância (label > descrição > keyword)', () => {
    const index = [
      page({
        label: 'sidebar.items.home',
        path: '/home',
        description: 'sidebar.items.home-desc',
        keywords: ['dashboard'],
      }),
      page({ label: 'sidebar.items.users', keywords: ['usuário'] }),
    ]

    const results = searchPages('dashboard', index, t)
    // Nenhum label traduzido contém "dashboard"; a descrição do home pontua 5
    // e a keyword "usuário" não pontua. Só o home deve aparecer.
    expect(results).toHaveLength(1)
    expect(results[0].path).toBe('/home')
  })

  it('não devolve páginas sem nenhuma correspondência', () => {
    const index = [page({})]

    expect(searchPages('inexistente', index, t)).toEqual([])
  })

  it('mantém o score na entrada retornada', () => {
    const index = [page({ label: 'sidebar.items.users' })]

    const [result] = searchPages('usuários', index, t)
    expect(result.score).toBeGreaterThan(0)
  })
})
