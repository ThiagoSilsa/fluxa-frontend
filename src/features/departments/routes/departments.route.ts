import { z } from 'zod'

/** Caminho da rota de departamentos (file-based: `/management/departments`). */
export const departmentsPath = '/management/departments'

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

export const departmentsSearchSchema = z.object({
  search: z.string().optional(),
  isActive: booleanParam,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

/** Tipo dos search params da rota de departamentos. */
export type DepartmentsSearch = z.infer<typeof departmentsSearchSchema>
