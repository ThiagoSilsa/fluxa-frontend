// Controller
import baseController from '#/shared/controller/base.controller'

// Mappers
import { buildAccessRequestListQuery } from '../mappers/access-request.mapper'

// Types
import type {
  AcceptAccessRequestPayload,
  AccessRequestListParams,
  AccessRequestResponse,
  CreateAccessRequestPayload,
  HandleAccessRequestPayload,
  ListAccessRequestsResponse,
  UserOption,
  VehicleOption,
  VehicleTypeOption,
} from '../types/access-requests.types'

/**
 * Serviço de solicitações de acesso (ADR 0010 M2 — regra 41).
 *
 * Consome `/access-requests` (CRUD + transições) e, para os seletores dos
 * cenários NEW_USER/NEW_VEHICLE/LINK, os endpoints de leitura de veículos e
 * usuários (`GET /vehicles`, `GET /users`).
 */
class AccessRequestService {
  /**
   * Lista as solicitações da empresa (paginada/filtrada no servidor).
   *
   * @param params Filtros (status/placa) e paginação.
   * @returns Envelope paginado.
   */
  async list(params: AccessRequestListParams): Promise<ListAccessRequestsResponse> {
    const query = buildAccessRequestListQuery(params)
    return baseController.makeRequest({
      endpoint: `/access-requests?${query}`,
      method: 'GET',
    })
  }

  /**
   * Detalha uma solicitação.
   *
   * @param id Id da solicitação.
   * @returns Solicitação detalhada.
   */
  async get(id: string): Promise<AccessRequestResponse> {
    return baseController.makeRequest({
      endpoint: `/access-requests/${id}`,
      method: 'GET',
    })
  }

  /**
   * Cria uma solicitação (porteiro — CREATE_ACCESS_REQUEST).
   *
   * @param payload Dados do cenário (placa + tipo + dados).
   * @returns Solicitação criada.
   */
  async create(payload: CreateAccessRequestPayload): Promise<AccessRequestResponse> {
    return baseController.makeRequest({
      endpoint: '/access-requests',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Aceita uma solicitação (admin — resolução retroativa).
   *
   * @param id Id da solicitação.
   * @param payload Dados do aceite (tipo do veículo a criar, can_drive...).
   * @returns Solicitação atualizada.
   */
  async accept(id: string, payload: AcceptAccessRequestPayload): Promise<AccessRequestResponse> {
    return baseController.makeRequest({
      endpoint: `/access-requests/${id}/accept`,
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Rejeita uma solicitação.
   *
   * @param id Id da solicitação.
   * @param payload Observação opcional.
   * @returns Solicitação atualizada.
   */
  async reject(
    id: string,
    payload: HandleAccessRequestPayload = {},
  ): Promise<AccessRequestResponse> {
    return baseController.makeRequest({
      endpoint: `/access-requests/${id}/reject`,
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Marca uma solicitação como em contato (estende o prazo — regra 39).
   *
   * @param id Id da solicitação.
   * @param payload Observação opcional.
   * @returns Solicitação atualizada.
   */
  async markInContact(
    id: string,
    payload: HandleAccessRequestPayload = {},
  ): Promise<AccessRequestResponse> {
    return baseController.makeRequest({
      endpoint: `/access-requests/${id}/in-contact`,
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Cancela uma solicitação (porteiro — apenas PENDING).
   *
   * @param id Id da solicitação.
   * @returns Solicitação atualizada.
   */
  async cancel(id: string): Promise<AccessRequestResponse> {
    return baseController.makeRequest({
      endpoint: `/access-requests/${id}/cancel`,
      method: 'POST',
      body: {},
    })
  }

  /**
   * Busca veículos para o seletor (cenários NEW_USER/LINK).
   *
   * @param search Busca por placa/modelo.
   * @returns Opções de veículo.
   */
  async listVehicles(search: string): Promise<VehicleOption[]> {
    const response = (await baseController.makeRequest({
      endpoint: `/vehicles?search=${encodeURIComponent(search)}&limit=10&offset=0`,
      method: 'GET',
    })) as { data: VehicleOption[] }
    return response.data
  }

  /**
   * Busca usuários para o seletor (cenários NEW_VEHICLE/LINK).
   *
   * @param search Busca por nome/e-mail.
   * @returns Opções de usuário.
   */
  async listUsers(search: string): Promise<UserOption[]> {
    const response = (await baseController.makeRequest({
      endpoint: `/users?search=${encodeURIComponent(search)}&limit=10&offset=0`,
      method: 'GET',
    })) as { data: UserOption[] }
    return response.data
  }

  /**
   * Lista os tipos de veículo ativos (aceite de NEW_VEHICLE/BOTH — o tipo é
   * escolhido pela administração no aceite, regra 22).
   *
   * @returns Tipos de veículo ativos.
   */
  async listVehicleTypes(): Promise<VehicleTypeOption[]> {
    const response = (await baseController.makeRequest({
      endpoint: '/vehicle-types?isActive=true&limit=100&offset=0',
      method: 'GET',
    })) as { data: VehicleTypeOption[] }
    return response.data
  }
}

/** Instância única do serviço de solicitações de acesso. */
export const accessRequestService = new AccessRequestService()
