import { z } from 'zod'

/** Caminho da rota de cargos (file-based: `/management/roles`). */
export const rolesPath = '/management/roles'

/** Coerce de boolean vindo da URL (`'true'`/`'false'` → boolean). */
const booleanParam = z.preprocess((value) => {
  if (value === 'true' || value === true) {
    return true
  }

  if (value === 'false' || value === false) {
    return false
  }

  return undefined
}, z.boolean().optional())

/**
 * Schema dos search params da rota de cargos.
 *
 * Usado no `validateSearch` da rota file-based e tipa a leitura via
 * `getRouteApi`. `limit`/`offset` são coerced de string (vêm da URL) e têm
 * default — a listagem é paginada no servidor com filtros `search` e
 * `isActive` (server-side).
 */
export const rolesSearchSchema = z.object({
  search: z.string().optional(),
  isActive: booleanParam,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

/** Tipo dos search params da rota de cargos. */
export type RolesSearch = z.infer<typeof rolesSearchSchema>
