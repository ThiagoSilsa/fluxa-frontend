// Controller
import baseController from '#/shared/controller/base.controller'

// Mappers
import { buildBlockRequestsListQuery, buildBlocksListQuery } from '../mappers/block.mapper'

// Types
import type {
  BlockListParams,
  BlockRequestListParams,
  BlockRequestResponse,
  BlockResponse,
  CreateBlockPayload,
  HandleBlockRequestPayload,
  ListBlockRequestsResponse,
  ListBlocksResponse,
  RevokeBlockPayload,
} from '../types/blocks.types'

/**
 * Serviço de bloqueios (ADR 0010 §2 — M1).
 *
 * Consome `/blocks` (gestão — MANAGE_BLOCKS) e `/block-requests`
 * (porteiro cria/cancela; administração aprova/rejeita).
 */
class BlockService {
  /**
   * Lista os bloqueios da empresa (busca + status + paginação).
   *
   * @param params Filtros e paginação.
   * @returns Envelope paginado.
   */
  async listBlocks(params: BlockListParams): Promise<ListBlocksResponse> {
    const query = buildBlocksListQuery(params)
    return baseController.makeRequest({
      endpoint: `/blocks?${query}`,
      method: 'GET',
    })
  }

  /**
   * Cria um bloqueio (MANAGE_BLOCKS — mantém `is_blocked` do veículo).
   *
   * @param payload Placa + motivo.
   * @returns Bloqueio criado.
   */
  async createBlock(payload: CreateBlockPayload): Promise<BlockResponse> {
    return baseController.makeRequest({
      endpoint: '/blocks',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Revoga um bloqueio ativo (motivo obrigatório).
   *
   * @param id Id do bloqueio.
   * @param payload Motivo da revogação.
   * @returns Bloqueio revogado.
   */
  async revokeBlock(id: string, payload: RevokeBlockPayload): Promise<BlockResponse> {
    return baseController.makeRequest({
      endpoint: `/blocks/${id}/revoke`,
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Lista as solicitações de bloqueio (status + paginação — MANAGE_BLOCKS).
   *
   * @param params Filtros e paginação.
   * @returns Envelope paginado.
   */
  async listBlockRequests(params: BlockRequestListParams): Promise<ListBlockRequestsResponse> {
    const query = buildBlockRequestsListQuery(params)
    return baseController.makeRequest({
      endpoint: `/block-requests?${query}`,
      method: 'GET',
    })
  }

  /**
   * Cria uma solicitação de bloqueio (porteiro — CREATE_BLOCK_REQUEST).
   *
   * @param payload Placa + motivo.
   * @returns Solicitação criada.
   */
  async createBlockRequest(payload: CreateBlockPayload): Promise<BlockRequestResponse> {
    return baseController.makeRequest({
      endpoint: '/block-requests',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Aprova uma solicitação de bloqueio (MANAGE_BLOCKS — cria o bloqueio).
   *
   * @param id Id da solicitação.
   * @param payload Observação opcional.
   * @returns Solicitação atualizada.
   */
  async approveBlockRequest(
    id: string,
    payload: HandleBlockRequestPayload = {},
  ): Promise<BlockRequestResponse> {
    return baseController.makeRequest({
      endpoint: `/block-requests/${id}/approve`,
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Rejeita uma solicitação de bloqueio.
   *
   * @param id Id da solicitação.
   * @param payload Observação opcional.
   * @returns Solicitação atualizada.
   */
  async rejectBlockRequest(
    id: string,
    payload: HandleBlockRequestPayload = {},
  ): Promise<BlockRequestResponse> {
    return baseController.makeRequest({
      endpoint: `/block-requests/${id}/reject`,
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Cancela uma solicitação de bloqueio (porteiro — apenas PENDING).
   *
   * @param id Id da solicitação.
   * @returns Solicitação atualizada.
   */
  async cancelBlockRequest(id: string): Promise<BlockRequestResponse> {
    return baseController.makeRequest({
      endpoint: `/block-requests/${id}/cancel`,
      method: 'POST',
      body: {},
    })
  }
}

/** Instância única do serviço de bloqueios. */
export const blockService = new BlockService()
