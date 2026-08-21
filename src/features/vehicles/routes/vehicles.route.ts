import { z } from 'zod'

/** Caminho da rota de veículos (file-based: `/management/vehicles`). */
export const vehiclesPath = '/management/vehicles'

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

export const vehiclesSearchSchema = z.object({
  search: z.string().optional(),
  isActive: booleanParam,
  freePass: booleanParam,
  vehicleTypeId: z.string().optional(),
  departmentId: z.string().optional(),
  sortBy: z.enum(['plate', 'isActive', 'createdAt']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
})

/** Tipo dos search params da rota de veículos. */
export type VehiclesSearch = z.infer<typeof vehiclesSearchSchema>
