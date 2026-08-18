// Mapper
import { buildDepartmentListQuery } from '../mappers/department.mapper'

// Types
import type {
  CreateDepartmentPayload,
  DepartmentEntity,
  DepartmentListParams,
  DepartmentListResponse,
  UpdateDepartmentPayload,
} from '../types/departments.types'

// Controller
import baseController from '#/shared/controller/base.controller'

class DepartmentsService {
  /**
   * Lista departamentos da empresa (paginada no servidor).
   *
   * @param params Busca, filtro de status e paginação.
   * @returns Envelope paginado de departamentos.
   */
  async list(params: DepartmentListParams): Promise<DepartmentListResponse> {
    const query = buildDepartmentListQuery(params)

    return baseController.makeRequest({
      endpoint: `/departments?${query}`,
      method: 'GET',
    })
  }

  /**
   * Cria um departamento na empresa da sessão.
   *
   * @param payload Dados de criação (name + parkingSpace obrigatórios).
   * @returns Departamento criado.
   */
  async create(payload: CreateDepartmentPayload): Promise<DepartmentEntity> {
    return baseController.makeRequest({
      endpoint: '/departments',
      method: 'POST',
      body: payload,
    })
  }

  /**
   * Atualiza um departamento da empresa (PATCH parcial).
   *
   * @param departmentId Id do departamento.
   * @param payload Campos a atualizar.
   * @returns Departamento atualizado.
   */
  async update(departmentId: string, payload: UpdateDepartmentPayload): Promise<DepartmentEntity> {
    return baseController.makeRequest({
      endpoint: `/departments/${departmentId}`,
      method: 'PATCH',
      body: payload,
    })
  }

  /**
   * Exclui fisicamente um departamento (DELETE = 204).
   *
   * Bloqueado com 409 pelo backend quando há veículos vinculados via
   * `vehicle_department` (departamento padrão).
   *
   * @param departmentId Id do departamento.
   */
  async remove(departmentId: string): Promise<void> {
    await baseController.makeRequest({
      endpoint: `/departments/${departmentId}`,
      method: 'DELETE',
    })
  }
}

export const departmentsService = new DepartmentsService()
