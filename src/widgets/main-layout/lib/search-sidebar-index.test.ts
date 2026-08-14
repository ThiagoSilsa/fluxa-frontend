// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { buildSearchIndex } from './search-sidebar-index'

// Types
import type { SidebarItem } from '../types/sidebar.type'

/** Item de menu mínimo — o ícone não participa do índice. */
const item = (over: Partial<SidebarItem>): SidebarItem => ({
  label: 'x',
  icon: () => null,
  ...over,
})

describe('buildSearchIndex', () => {
  it('gera entry para item com path', () => {
    const index = buildSearchIndex([item({ label: 'a', path: '/home' })])

    expect(index).toHaveLength(1)
    expect(index[0]).toMatchObject({
      label: 'a',
      path: '/home',
      breadcrumb: [],
      keywords: [],
    })
  })

  it('não gera entry para container sem path', () => {
    const index = buildSearchIndex([
      item({
        label: 'management',
        children: [item({ label: 'users', path: '/management/users' })],
      }),
    ])

    expect(index).toHaveLength(1)
    expect(index[0].path).toBe('/management/users')
  })

  it('não adiciona container sem path ao breadcrumb dos filhos', () => {
    const index = buildSearchIndex([
      item({
        label: 'management',
        children: [item({ label: 'users', path: '/management/users' })],
      }),
    ])

    // O "Gerenciamento" é um container visual (sem path): o label dele não
    // entra no breadcrumb — comportamento herdado do modelo original.
    expect(index[0].breadcrumb).toEqual([])
  })

  it('adiciona o label do container ao breadcrumb quando ele tem path', () => {
    const index = buildSearchIndex([
      item({
        label: 'settings',
        path: '/settings',
        children: [item({ label: 'general', path: '/settings/general' })],
      }),
    ])

    // index[0] é a entry do próprio "settings"; index[1] é o filho, com o pai
    // no breadcrumb.
    expect(index).toHaveLength(2)
    expect(index[1].breadcrumb).toEqual(['settings'])
  })

  it('usa description e keywords do searchOverrides', () => {
    const index = buildSearchIndex([
      item({ label: 'sidebar.items.users', path: '/management/users' }),
    ])

    expect(index[0].description).toBe('sidebar.items.users-desc')
    expect(index[0].keywords.length).toBeGreaterThan(0)
  })

  it('inclui o label do container e do grupo no breadcrumb', () => {
    const index = buildSearchIndex([
      item({
        label: 'settings',
        groups: [
          { label: 'general', items: [item({ label: 'users', path: '/management/users' })] },
        ],
      }),
    ])

    expect(index).toHaveLength(1)
    expect(index[0].breadcrumb).toEqual(['settings', 'general'])
  })

  it('achata children e groups recursivamente', () => {
    const index = buildSearchIndex([
      item({
        label: 'a',
        path: '/a',
        children: [item({ label: 'b', path: '/a/b' })],
        groups: [{ label: 'g', items: [item({ label: 'c', path: '/a/c' })] }],
      }),
    ])

    expect(index.map((entry) => entry.path)).toEqual(['/a', '/a/b', '/a/c'])
  })
})
