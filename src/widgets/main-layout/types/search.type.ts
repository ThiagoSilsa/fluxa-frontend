export type SearchablePage = {
  /** Chave i18n do label da página */
  label: string
  /** Rota de navegação */
  path: string
  /** Ícone da página (mesmo do sidebarItems) */
  icon: React.ElementType
  /** Chave i18n opcional para descrição/subtítulo */
  description?: string
  /** Caminho hierárquico em chaves i18n (ex: ['sidebar.items.settings']) */
  breadcrumb: string[]
  /** Termos adicionais para enriquecer a busca (sinônimos, variações) */
  keywords: string[]
}

export type SearchResult = SearchablePage & {
  /** Label traduzido no locale ativo */
  translatedLabel: string
  /** Breadcrumbs traduzidos no locale ativo */
  translatedBreadcrumb: string[]
  /** Descrição traduzida, se houver */
  translatedDescription?: string
  /** Pontuação de relevância (quanto maior, mais relevante) */
  score: number
}
