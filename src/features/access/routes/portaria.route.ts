import { z } from 'zod'

/** Caminho da rota da portaria (file-based: `/portaria`). */
export const portariaPath = '/portaria'

/**
 * Search params da portaria — filtros e paginação do feed de registros.
 *
 * Ficam na URL (como nas demais listagens do projeto) para o porteiro poder
 * compartilhar/voltar a um recorte. `entranceId` aceita o sentinela `all`
 * ("todas as portarias"), que vence a portaria do dispositivo.
 */
export const portariaSearchSchema = z.object({
  kind: z.enum(['ENTRY', 'EXIT', 'DENIAL']).optional(),
  /** Placa (parcial). */
  plate: z.string().optional(),
  /** Dia inicial do período (`yyyy-mm-dd`). */
  dateFrom: z.string().optional(),
  /** Dia final do período (`yyyy-mm-dd` — inclui o dia inteiro). */
  dateTo: z.string().optional(),
  /** Portaria filtrada (id) ou `all`. */
  entranceId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

/** Tipo dos search params da rota da portaria. */
export type PortariaSearch = z.infer<typeof portariaSearchSchema>
