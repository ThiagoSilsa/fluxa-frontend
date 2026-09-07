import { describe, expect, it } from 'vitest'
import { useRoleOptions } from './use-role-options'

import type { UserListResponse } from '../types/users.types'

/** Listagem com o catálogo de cargos no `parameters` (chave `role_id`). */
function buildUsersData(
  allowedValues: Array<{ id: string; name: string; isAdmin?: boolean }>,
): UserListResponse {
  return {
    limit: 10,
    offset: 0,
    data: [],
    count: 0,
    parameters: [{ key: 'role_id', label: 'Cargo', allowed_values: allowedValues }],
  }
}

// ---------------------------------------------------------------------------
// useRoleOptions (derivação dos `parameters` do GET /users)
// ---------------------------------------------------------------------------
describe('useRoleOptions', () => {
  it('retorna todos os cargos ativos para um admin', () => {
    const result = useRoleOptions(
      true,
      buildUsersData([
        { id: 'r1', name: 'Porteiro', isAdmin: false },
        { id: 'r3', name: 'Administração', isAdmin: true },
      ]),
    )

    expect(result.map((role) => role.id)).toEqual(['r1', 'r3'])
    expect(result[0]).toEqual({
      id: 'r1',
      name: 'Porteiro',
      isAdmin: false,
      isActive: true,
    })
  })

  it('oculta cargos is_admin para quem não gerencia administradores', () => {
    const result = useRoleOptions(
      false,
      buildUsersData([
        { id: 'r1', name: 'Porteiro', isAdmin: false },
        { id: 'r3', name: 'Administração', isAdmin: true },
      ]),
    )

    expect(result.map((role) => role.id)).toEqual(['r1'])
  })

  it('normaliza isAdmin ausente como false', () => {
    const result = useRoleOptions(true, buildUsersData([{ id: 'r1', name: 'Porteiro' }]))

    expect(result[0].isAdmin).toBe(false)
  })

  it('devolve lista vazia sem data/parameters', () => {
    expect(useRoleOptions(true, undefined)).toEqual([])
    expect(useRoleOptions(true, { limit: 10, offset: 0, data: [], count: 0 })).toEqual([])
  })
})
