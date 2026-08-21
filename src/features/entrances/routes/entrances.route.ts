import { z } from 'zod'

/** Caminho da rota de portarias (file-based: `/management/entrances`). */
export const entrancesPath = '/management/entrances'

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

export const entrancesSearchSchema = z.object({
  search: z.string().optional(),
  isActive: booleanParam,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

/** Tipo dos search params da rota de portarias. */
export type EntrancesSearch = z.infer<typeof entrancesSearchSchema>
