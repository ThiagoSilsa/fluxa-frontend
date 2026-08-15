import { z } from 'zod'

/** Caminho da rota de cargos (file-based: `/management/roles`). */
export const rolesPath = '/management/roles'

/**
 * Schema dos search params da rota de cargos.
 *
 * Usado no `validateSearch` da rota file-based e tipa a leitura via
 * `getRouteApi`. `limit`/`offset` são coerced de string (vêm da URL) e têm
 * default — a listagem é paginada no servidor.
 */
export const rolesSearchSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

/** Tipo dos search params da rota de cargos. */
export type RolesSearch = z.infer<typeof rolesSearchSchema>
