// Mapper
import { buildDeviceListQuery } from '../mappers/device.mapper'

// Types
import type {
  CreateDevicePayload,
  DeviceEntity,
  DeviceListParams,
  DeviceListResponse,
  DeviceWithTokenResponse,
  UpdateDevicePayload,
} from '../types/devices.types'

// Controller
import baseController from '#/shared/controller/base.controller'

class DevicesService {
  /**
   * Lista dispositivos da empresa (paginada/ordenada no servidor).
   *
   * @param params Busca, filtros, ordenação e paginação.
   * @returns Envelope paginado com `parameters` (portarias ativas).
   */
  async list(params: DeviceListParams): Promise<DeviceListResponse> {
    const query = buildDeviceListQuery(params)

    return baseController.makeRequest({
      endpoint: `/devices?${query}`,
      method: 'GET',
    })
  }

  /**
   * Cria um dispositivo na empresa da sessão.
   *
   * O backend gera o token e o devolve **apenas nesta resposta** (write-only).
   *
   * @param payload Dados de criação (nome + plataforma obrigatórios).
   * @returns Dispositivo criado + token (exibido uma única vez).
   */
  async create(payload: CreateDevicePayload): Promise<DeviceWithTokenResponse> {
    return baseController.makeRequest({
      endpoint: '/devices',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Atualiza um dispositivo da empresa (PATCH parcial).
   *
   * @param deviceId Id do dispositivo.
   * @param payload Campos a atualizar (nome/portaria/status).
   * @returns Dispositivo atualizado.
   */
  async update(deviceId: string, payload: UpdateDevicePayload): Promise<DeviceEntity> {
    return baseController.makeRequest({
      endpoint: `/devices/${deviceId}`,
      method: 'PATCH',
      body: payload,
    })
  }

  /**
   * Exclui fisicamente um dispositivo (DELETE = 204).
   *
   * @param deviceId Id do dispositivo.
   */
  async remove(deviceId: string): Promise<void> {
    await baseController.makeRequest({
      endpoint: `/devices/${deviceId}`,
      method: 'DELETE',
    })
  }

  /**
   * Rotaciona o token de um dispositivo (invalida o anterior — ADR 0008 §3).
   *
   * @param deviceId Id do dispositivo.
   * @returns Dispositivo atualizado + novo token (exibido uma única vez).
   */
  async rotateToken(deviceId: string): Promise<DeviceWithTokenResponse> {
    return baseController.makeRequest({
      endpoint: `/devices/${deviceId}/rotate-token`,
      method: 'POST',
    })
  }
}

export const devicesService = new DevicesService()
