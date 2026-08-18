// Mapper
import { buildVehicleTypeListQuery } from '../mappers/vehicle-type.mapper'

// Types
import type {
  CreateVehicleTypePayload,
  UpdateVehicleTypePayload,
  VehicleTypeEntity,
  VehicleTypeListParams,
  VehicleTypeListResponse,
} from '../types/vehicle-types.types'

// Controller
import baseController from '#/shared/controller/base.controller'

/**
 * Service de tipos de veículo.
 *
 * Responsável por toda comunicação com a API de tipos de veículo
 * (`/vehicle-types`). Contrato (ADR 0006 + Fase 1): listagem paginada com
 * filtros `search`/`isFleet`/`isActive`, criação, atualização (PATCH) e
 * exclusão física (DELETE 204 — bloqueada com 409 quando há veículos da
 * empresa usando o tipo).
 */
class VehicleTypesService {
  /**
   * Lista tipos de veículo paginados.
   *
   * @param params Busca, filtros e paginação.
   * @returns Envelope paginado `{ limit, offset, data, count }`.
   */
  async list(params: VehicleTypeListParams): Promise<VehicleTypeListResponse> {
    const query = buildVehicleTypeListQuery(params)

    return baseController.makeRequest({
      endpoint: `/vehicle-types?${query}`,
      method: 'GET',
    })
  }

  /**
   * Cria um novo tipo de veículo (nasce ativo).
   *
   * @param payload Dados para criação (code normalizado no mapper).
   * @returns O tipo criado.
   */
  async create(payload: CreateVehicleTypePayload): Promise<VehicleTypeEntity> {
    return baseController.makeRequest({
      endpoint: '/vehicle-types',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Atualiza um tipo de veículo existente.
   *
   * @param vehicleTypeId ID do tipo.
   * @param payload Dados para atualização (diff).
   * @returns O tipo atualizado.
   */
  async update(
    vehicleTypeId: string,
    payload: UpdateVehicleTypePayload,
  ): Promise<VehicleTypeEntity> {
    return baseController.makeRequest({
      endpoint: `/vehicle-types/${vehicleTypeId}`,
      method: 'PATCH',
      body: payload,
    })
  }

  /**
   * Exclui fisicamente um tipo de veículo (DELETE 204 no backend — bloqueado
   * com 409 quando há veículos da empresa usando o tipo, ADR 0006 §6).
   *
   * @param vehicleTypeId ID do tipo.
   */
  async remove(vehicleTypeId: string): Promise<void> {
    await baseController.makeRequest({
      endpoint: `/vehicle-types/${vehicleTypeId}`,
      method: 'DELETE',
    })
  }
}

export const vehicleTypesService = new VehicleTypesService()
