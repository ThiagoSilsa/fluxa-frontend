// Vitest
import { describe, expect, it } from 'vitest'

// Lib
import { filterSidebarItems } from './filter-sidebar-items'

// Types
import type { SidebarItem } from '../types/sidebar.type'
import type { AuthUser } from '#/shared/types/auth.types'

describe('filterSidebarItems', () => {
  const user: AuthUser = {
    id: '1',
    email: 'user@co.com',
    name: 'User',
    companyId: 'c1',
    roleCodes: ['admin'],
    permissionCodes: ['MANAGE_USERS', 'MANAGE_ROLES'],
  }

  const UnitIcon = () => null
  const SettingsIcon = () => null
  const UserIcon = () => null

  it('devolve array vazio quando os itens estão vazios', () => {
    const result = filterSidebarItems([], user)
    expect(result).toEqual([])
  })

  it('devolve todos os itens quando não há permissões nem cargos exigidos', () => {
    const items: SidebarItem[] = [{ label: 'units', icon: UnitIcon }]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('units')
  })

  it('inclui o item quando o usuário tem a permissão exigida', () => {
    const items: SidebarItem[] = [{ label: 'units', icon: UnitIcon, permissions: ['MANAGE_USERS'] }]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('units')
  })

  it('inclui o item quando o usuário tem o cargo exigido', () => {
    const items: SidebarItem[] = [{ label: 'admin', icon: SettingsIcon, roles: ['admin'] }]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('admin')
  })

  it('exclui o item quando o usuário não tem a permissão exigida', () => {
    const items: SidebarItem[] = [
      { label: 'users', icon: UserIcon, permissions: ['MANAGE_DEVICES'] },
    ]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(0)
  })

  it('exclui o item quando o usuário não tem o cargo exigido', () => {
    const items: SidebarItem[] = [{ label: 'super', icon: SettingsIcon, roles: ['superadmin'] }]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(0)
  })

  it('inclui o item pai quando pelo menos um filho é acessível', () => {
    const items: SidebarItem[] = [
      {
        label: 'management',
        icon: SettingsIcon,
        children: [
          { label: 'users', icon: UserIcon, permissions: ['MANAGE_USERS'] },
          { label: 'devices', icon: UnitIcon, permissions: ['MANAGE_DEVICES'] },
        ],
      },
    ]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('management')
    expect(result[0].children).toHaveLength(1)
    expect(result[0].children![0].label).toBe('users')
  })

  it('exclui o item pai quando ele exige permissão e nenhum filho é acessível', () => {
    const items: SidebarItem[] = [
      {
        label: 'management',
        icon: SettingsIcon,
        permissions: ['MANAGE_DEVICES'],
        children: [{ label: 'users', icon: UserIcon, permissions: ['MANAGE_DEVICES'] }],
      },
    ]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(0)
  })

  it('inclui o item pai quando tem acesso direto, independente dos filhos', () => {
    const items: SidebarItem[] = [
      {
        label: 'management',
        icon: SettingsIcon,
        permissions: ['MANAGE_USERS'],
        children: [{ label: 'users', icon: UserIcon, permissions: ['MANAGE_DEVICES'] }],
      },
    ]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('management')
    // children ainda são filtrados
    expect(result[0].children).toHaveLength(0)
  })

  it('filtra grupos e mantém apenas os com itens acessíveis', () => {
    const items: SidebarItem[] = [
      {
        label: 'settings',
        icon: SettingsIcon,
        groups: [
          {
            label: 'general',
            items: [{ label: 'users', icon: UserIcon, permissions: ['MANAGE_USERS'] }],
          },
          {
            label: 'advanced',
            items: [{ label: 'devices', icon: UnitIcon, permissions: ['MANAGE_DEVICES'] }],
          },
        ],
      },
    ]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(1)
    expect(result[0].groups).toHaveLength(1)
    expect(result[0].groups![0].label).toBe('general')
  })

  it('remove grupos quando o pai exige permissão e nenhum item é acessível', () => {
    const items: SidebarItem[] = [
      {
        label: 'settings',
        icon: SettingsIcon,
        permissions: ['MANAGE_DEVICES'],
        groups: [
          {
            label: 'advanced',
            items: [{ label: 'users', icon: UserIcon, permissions: ['MANAGE_DEVICES'] }],
          },
        ],
      },
    ]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(0)
  })

  it('devolve array vazio quando o usuário é null e os itens exigem permissão', () => {
    const items: SidebarItem[] = [{ label: 'units', icon: UnitIcon, permissions: ['MANAGE_USERS'] }]

    const result = filterSidebarItems(items, null)
    expect(result).toHaveLength(0)
  })

  it('trata children aninhados recursivamente', () => {
    const items: SidebarItem[] = [
      {
        label: 'level1',
        icon: SettingsIcon,
        children: [
          {
            label: 'level2',
            icon: SettingsIcon,
            children: [{ label: 'users', icon: UserIcon, permissions: ['MANAGE_USERS'] }],
          },
        ],
      },
    ]

    const result = filterSidebarItems(items, user)
    expect(result).toHaveLength(1)
    expect(result[0].children).toHaveLength(1)
    expect(result[0].children![0].children).toHaveLength(1)
    expect(result[0].children![0].children![0].label).toBe('users')
  })
})
