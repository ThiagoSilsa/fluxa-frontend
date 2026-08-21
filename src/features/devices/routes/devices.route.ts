import { z } from 'zod'

/** Caminho da rota de dispositivos (file-based: `/management/devices`). */
export const devicesPath = '/management/devices'

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

export const devicesSearchSchema = z.object({
  search: z.string().optional(),
  isActive: booleanParam,
  sortBy: z.enum(['name', 'createdAt', 'lastSyncAt']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
})

/** Tipo dos search params da rota de dispositivos. */
export type DevicesSearch = z.infer<typeof devicesSearchSchema>
