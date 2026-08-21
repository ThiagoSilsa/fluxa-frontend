import { z } from 'zod'

/** Caminho da rota de importações (file-based: `/management/imports`). */
export const importsPath = '/management/imports'

/**
 * Schema dos search params da rota de importações.
 *
 * `tab` identifica a aba ativa (departments/vehicles/users/user-vehicles);
 * `limit`/`offset`/`sortBy`/`sortOrder` são a paginação/ordenação do histórico
 * (server-side via `useGenericTableSearch`).
 */
export const importSearchSchema = z.object({
  tab: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

/** Tipo dos search params da rota de importações. */
export type ImportSearch = z.infer<typeof importSearchSchema>
