// Mapper
import { buildVehicleListQuery } from '../mappers/vehicle.mapper'

// Types
import type {
  AddDriverPayload,
  CreateVehiclePayload,
  ListDriverCandidatesResponse,
  ListVehicleDriversResponse,
  UpdateDriverPayload,
  UpdateVehiclePayload,
  VehicleDepartmentLink,
  VehicleDetail,
  VehicleDriver,
  VehicleEntity,
  VehicleListParams,
  VehicleListResponse,
  VehicleQrEntity,
} from '../types/vehicles.types'

// Controller
import baseController from '#/shared/controller/base.controller'

class VehiclesService {
  /**
   * Lista veículos da empresa (paginada/ordenada no servidor).
   *
   * @param params Busca, filtros, ordenação e paginação.
   * @returns Envelope paginado com `parameters` (tipos/departamentos ativos).
   */
  async list(params: VehicleListParams): Promise<VehicleListResponse> {
    const query = buildVehicleListQuery(params)

    return baseController.makeRequest({
      endpoint: `/vehicles?${query}`,
      method: 'GET',
    })
  }

  /**
   * Cria um veículo na empresa da sessão.
   *
   * @param payload Dados de criação (placa normalizada + tipo obrigatórios).
   * @returns Veículo criado.
   */
  async create(payload: CreateVehiclePayload): Promise<VehicleEntity> {
    return baseController.makeRequest({
      endpoint: '/vehicles',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Atualiza um veículo da empresa (PATCH parcial).
   *
   * @param vehicleId Id do veículo.
   * @param payload Campos a atualizar.
   * @returns Veículo atualizado.
   */
  async update(vehicleId: string, payload: UpdateVehiclePayload): Promise<VehicleEntity> {
    return baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}`,
      method: 'PATCH',
      body: payload,
    })
  }

  /**
   * Exclui fisicamente um veículo (DELETE = 204).
   *
   * Bloqueado com 409 pelo backend quando há vínculos (departamento padrão ou
   * motoristas) apontando para o veículo.
   *
   * @param vehicleId Id do veículo.
   */
  async remove(vehicleId: string): Promise<void> {
    await baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}`,
      method: 'DELETE',
    })
  }

  /**
   * Detalha um veículo agregado (tipo + departamento + motoristas).
   *
   * @param vehicleId Id do veículo.
   * @returns Detalhe agregado do veículo.
   */
  async get(vehicleId: string): Promise<VehicleDetail> {
    return baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}`,
      method: 'GET',
    })
  }

  /**
   * Define o departamento padrão do veículo (upsert na linha única).
   *
   * @param vehicleId Id do veículo.
   * @param departmentId Id do departamento.
   * @returns Vínculo de departamento.
   */
  async setDepartment(vehicleId: string, departmentId: string): Promise<VehicleDepartmentLink> {
    return baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}/department`,
      method: 'PUT',
      body: { departmentId },
    })
  }

  /**
   * Remove o departamento padrão do veículo (DELETE = 204, soft).
   *
   * @param vehicleId Id do veículo.
   */
  async removeDepartment(vehicleId: string): Promise<void> {
    await baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}/department`,
      method: 'DELETE',
    })
  }

  /**
   * Lista os motoristas de um veículo.
   *
   * @param vehicleId Id do veículo.
   * @returns Lista de motoristas (sem paginação).
   */
  async listDrivers(vehicleId: string): Promise<ListVehicleDriversResponse> {
    return baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}/drivers`,
      method: 'GET',
    })
  }

  /**
   * Vincula um motorista a um veículo.
   *
   * @param vehicleId Id do veículo.
   * @param payload Dados do vínculo (userId + opcionais).
   * @returns Vínculo criado.
   */
  async addDriver(vehicleId: string, payload: AddDriverPayload): Promise<VehicleDriver> {
    return baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}/drivers`,
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Atualiza o vínculo de um motorista (isPrimary/canDrive).
   *
   * @param vehicleId Id do veículo.
   * @param userId Id do usuário.
   * @param payload Campos a atualizar.
   * @returns Vínculo atualizado.
   */
  async updateDriver(
    vehicleId: string,
    userId: string,
    payload: UpdateDriverPayload,
  ): Promise<VehicleDriver> {
    return baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}/drivers/${userId}`,
      method: 'PATCH',
      body: payload,
    })
  }

  /**
   * Remove o vínculo de um motorista (DELETE = 204, físico).
   *
   * @param vehicleId Id do veículo.
   * @param userId Id do usuário.
   */
  async removeDriver(vehicleId: string, userId: string): Promise<void> {
    await baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}/drivers/${userId}`,
      method: 'DELETE',
    })
  }

  /**
   * Lista candidatos a motorista (pessoas com vínculo ativo na empresa).
   *
   * @param params Busca e paginação.
   * @returns Página de candidatos.
   */
  async listDriverCandidates(params: {
    search?: string
    limit?: number
    offset?: number
  }): Promise<ListDriverCandidatesResponse> {
    const searchParams = new URLSearchParams()
    if (params.search) {
      searchParams.set('search', params.search)
    }
    if (params.limit !== undefined) {
      searchParams.set('limit', String(params.limit))
    }
    if (params.offset !== undefined) {
      searchParams.set('offset', String(params.offset))
    }
    const query = searchParams.toString()

    return baseController.makeRequest({
      endpoint: `/vehicles/driver-candidates${query ? `?${query}` : ''}`,
      method: 'GET',
    })
  }

  /**
   * Devolve o QR **ativo** de um veículo (reimpressão — mesmo `code`).
   *
   * 404 quando não há QR ativo (nunca emitido/revogado/reemitido).
   *
   * @param vehicleId Id do veículo.
   * @returns QR ativo do veículo.
   */
  async getVehicleQr(vehicleId: string): Promise<VehicleQrEntity> {
    return baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}/qr`,
      method: 'GET',
    })
  }

  /**
   * Emite o QR permanente de um veículo (gera o `code` no backend).
   *
   * @param vehicleId Id do veículo.
   * @returns QR emitido (token permanente).
   */
  async emitVehicleQr(vehicleId: string): Promise<VehicleQrEntity> {
    return baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}/qr`,
      method: 'POST',
    })
  }

  /**
   * Reemite o QR de um veículo (revoga o atual + novo `code`).
   *
   * @param vehicleId Id do veículo.
   * @returns Novo QR (novo `code`).
   */
  async reissueVehicleQr(vehicleId: string): Promise<VehicleQrEntity> {
    return baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}/qr/reissue`,
      method: 'POST',
    })
  }

  /**
   * Revoga o QR ativo de um veículo (sem emitir outro — "expirado").
   *
   * @param vehicleId Id do veículo.
   */
  async revokeVehicleQr(vehicleId: string): Promise<void> {
    await baseController.makeRequest({
      endpoint: `/vehicles/${vehicleId}/qr/revoke`,
      method: 'POST',
    })
  }
}

export const vehiclesService = new VehiclesService()
