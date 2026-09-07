// Controller
import baseController from '#/shared/controller/base.controller'

// Types
import type {
  AccessEntryResponse,
  AccessExitResponse,
  OccupancyResponse,
  OpenAccessResponse,
  RegisterEntryPayload,
  RegisterExitPayload,
  ResolvedVehicleQr,
} from '../types/access.types'

/**
 * Serviço do fluxo de acesso (portaria web — ADR 0010 M5).
 *
 * Consome os endpoints do núcleo de acesso (`/access/*`) e a resolução de QR
 * (`/qr-codes/:code` — entrada por código, REGISTER_ENTRY).
 */
class AccessService {
  /**
   * Registra a entrada de um veículo.
   *
   * @param payload Placa (e autorização/condutor temporário, se houver).
   * @returns Entrada liberada (granted) ou impedimento registrado (denial).
   */
  async registerEntry(payload: RegisterEntryPayload): Promise<AccessEntryResponse> {
    return baseController.makeRequest({
      endpoint: '/access/entry',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Registra a saída de um veículo.
   *
   * @param payload Placa (e passageiro, se houver).
   * @returns Acessos encerrados (e NO_EXIT quando não havia entrada).
   */
  async registerExit(payload: RegisterExitPayload): Promise<AccessExitResponse> {
    return baseController.makeRequest({
      endpoint: '/access/exit',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Conferência na saída: quem entrou com o veículo (acessos INSIDE abertos).
   *
   * @param plate Placa normalizada.
   * @returns Acessos abertos do veículo.
   */
  async getOpenAccess(plate: string): Promise<{ data: OpenAccessResponse[] }> {
    return baseController.makeRequest({
      endpoint: `/access/open?plate=${encodeURIComponent(plate)}`,
      method: 'GET',
    })
  }

  /**
   * Ocupação em tempo real da empresa (VIEW_DASHBOARDS).
   *
   * @returns Ocupação total e por departamento ativo.
   */
  async getOccupancy(): Promise<OccupancyResponse> {
    return baseController.makeRequest({
      endpoint: '/access/occupancy',
      method: 'GET',
    })
  }

  /**
   * Resolve o QR code (token permanente do veículo) em dados do veículo.
   *
   * @param code Token do QR lido/colado na portaria.
   * @returns Veículo resolvido (placa, modelo, tipo...).
   */
  async resolveQr(code: string): Promise<ResolvedVehicleQr> {
    return baseController.makeRequest({
      endpoint: `/qr-codes/${encodeURIComponent(code)}`,
      method: 'GET',
    })
  }
}

/** Instância única do serviço de acesso. */
export const accessService = new AccessService()
