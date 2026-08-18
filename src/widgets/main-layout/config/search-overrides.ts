type SearchOverride = {
  /** Chave i18n para descrição do item */
  description?: string
  /** Termos extras para buscar (sinônimos, variações, termos em outros idiomas) */
  keywords?: string[]
}

/**
 * Mapa de enriquecimento dos itens da sidebar.
 * Use este mapa para adicionar descrições e keywords sem modificar o `sidebarItems`.
 * A chave é o `label` (chave i18n) do item.
 *
 * Exemplo:
 * ```ts
 * 'sidebar.items.users': {
 *   description: 'sidebar.items.users-desc',
 *   keywords: ['usuário', 'user', 'funcionário'],
 * }
 * ```
 */
export const searchOverrides: Record<string, SearchOverride> = {
  'sidebar.items.home': {
    description: 'sidebar.items.home-desc',
    keywords: ['início', 'inicio', 'dashboard', 'visão geral', 'overview'],
  },
  'sidebar.items.requests': {
    description: 'sidebar.items.requests-desc',
    keywords: [
      'solicitação',
      'solicitacao',
      'acesso',
      'bloqueio',
      'request',
      'approval',
      'aprovação',
      'aprovacao',
    ],
  },
  'sidebar.items.users': {
    description: 'sidebar.items.users-desc',
    keywords: [
      'usuário',
      'usuario',
      'user',
      'funcionário',
      'funcionario',
      'employee',
      'colaborador',
    ],
  },
  'sidebar.items.roles': {
    description: 'sidebar.items.roles-desc',
    keywords: ['cargo', 'role', 'permissão', 'permissao', 'permission', 'acesso', 'access'],
  },
  'sidebar.items.departments': {
    description: 'sidebar.items.departments-desc',
    keywords: ['departamento', 'department', 'setor', 'sector', 'área', 'area'],
  },
  'sidebar.items.entrances': {
    description: 'sidebar.items.entrances-desc',
    keywords: ['portaria', 'portarias', 'entrance', 'gate', 'guarita'],
  },
  'sidebar.items.vehicles': {
    description: 'sidebar.items.vehicles-desc',
    keywords: ['veículo', 'veiculo', 'vehicle', 'frota', 'fleet', 'carro', 'car'],
  },
  'sidebar.items.imports': {
    description: 'sidebar.items.imports-desc',
    keywords: [
      'importação',
      'importacao',
      'import',
      'csv',
      'upload',
      'planilha',
      'spreadsheet',
      'lote',
      'batch',
    ],
  },
  'sidebar.items.devices': {
    description: 'sidebar.items.devices-desc',
    keywords: ['dispositivo', 'device', 'equipamento', 'equipment', 'hardware'],
  },
}
