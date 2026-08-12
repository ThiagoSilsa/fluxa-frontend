import { z } from 'zod'

// endpoint, method = 'GET', body, headers = {}

export const baseControllerObjectSchema = z.object({
  endpoint: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
  body: z.any().optional(),
  headers: z.record(z.string(), z.string().default('')).default({}).optional(),
  isPublic: z.boolean().default(false).optional(),
  isFormData: z.boolean().default(false).optional(),
  /**
   * Como ler a resposta.
   *
   * `blob` é para arquivo: o padrão cai em `text()` quando o tipo não é JSON, e
   * texto **corrompe binário** — um XLSX lido assim chega ao disco ilegível.
   */
  responseType: z.enum(['auto', 'blob']).default('auto').optional(),
})

export type BaseControllerObject = z.infer<typeof baseControllerObjectSchema>
