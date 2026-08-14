// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { containsPath } from './contains-path'

// Types
import type { SidebarItem } from '../types/sidebar.type'

/** Item de menu mínimo — o ícone não participa da decisão. */
const item = (over: Partial<SidebarItem>): SidebarItem => ({
  label: 'x',
  icon: () => null,
  ...over,
})

describe('containsPath', () => {
  it('reconhece o próprio caminho', () => {
    expect(containsPath(item({ path: '/requests' }), '/requests')).toBe(true)
  })

  it('reconhece uma página abaixo do caminho', () => {
    expect(containsPath(item({ path: '/management' }), '/management/users')).toBe(true)
  })

  it('não confunde caminho com prefixo de outro', () => {
    // Sem o corte por `/`, a lista de usuários acenderia em qualquer rota que
    // começasse com o mesmo texto.
    expect(containsPath(item({ path: '/management/users' }), '/management/usersX')).toBe(false)
  })

  it('encontra a página dentro de um grupo', () => {
    const menu = item({
      groups: [{ label: 'g', items: [item({ path: '/management/devices' })] }],
    })

    expect(containsPath(menu, '/management/devices')).toBe(true)
  })

  it('encontra a página em children aninhados', () => {
    const menu = item({ children: [item({ children: [item({ path: '/requests' })] })] })

    expect(containsPath(menu, '/requests')).toBe(true)
  })

  it('aceita caminho declarado à parte, que não desce do principal', () => {
    // O detalhe de um veículo é da mesma seção que a lista, e o endereço não
    // diz isso: recarregar nele fecharia o menu.
    const vehicles = item({ path: '/management/vehicles', matchPaths: ['/management/vehicle'] })

    expect(containsPath(vehicles, '/management/vehicle/abc')).toBe(true)
  })

  it('nega a página de outra seção', () => {
    const menu = item({
      groups: [{ label: 'g', items: [item({ path: '/management/users' })] }],
    })

    expect(containsPath(menu, '/requests')).toBe(false)
  })

  it('nega o menu sem caminho nem filhos', () => {
    expect(containsPath(item({}), '/home')).toBe(false)
  })
})
