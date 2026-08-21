// Mapper
import { buildEntranceListQuery } from '../mappers/entrance.mapper'

// Types
import type {
  CreateEntrancePayload,
  EntranceEntity,
  EntranceListParams,
  EntranceListResponse,
  UpdateEntrancePayload,
} from '../types/entrances.types'

// Controller
import baseController from '#/shared/controller/base.controller'

class EntrancesService {
  /**
   * Lista portarias da empresa (paginada no servidor).
   *
   * @param params Busca, filtro de status e paginação.
   * @returns Envelope paginado de portarias.
   */
  async list(params: EntranceListParams): Promise<EntranceListResponse> {
    const query = buildEntranceListQuery(params)

    return baseController.makeRequest({
      endpoint: `/entrances?${query}`,
      method: 'GET',
    })
  }

  /**
   * Cria uma portaria na empresa da sessão.
   *
   * @param payload Dados de criação (name obrigatório).
   * @returns Portaria criada.
   */
  async create(payload: CreateEntrancePayload): Promise<EntranceEntity> {
    return baseController.makeRequest({
      endpoint: '/entrances',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Atualiza uma portaria da empresa (PATCH parcial).
   *
   * @param entranceId Id da portaria.
   * @param payload Campos a atualizar.
   * @returns Portaria atualizada.
   */
  async update(entranceId: string, payload: UpdateEntrancePayload): Promise<EntranceEntity> {
    return baseController.makeRequest({
      endpoint: `/entrances/${entranceId}`,
      method: 'PATCH',
      body: payload,
    })
  }

  /**
   * Exclui fisicamente uma portaria (DELETE = 204).
   *
   * Bloqueado com 409 pelo backend quando há dispositivos vinculados via
   * `device` (vínculo que torna a portaria selecionável).
   *
   * @param entranceId Id da portaria.
   */
  async remove(entranceId: string): Promise<void> {
    await baseController.makeRequest({
      endpoint: `/entrances/${entranceId}`,
      method: 'DELETE',
    })
  }
}

export const entrancesService = new EntrancesService()
