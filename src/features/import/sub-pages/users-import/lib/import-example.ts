/**
 * Cabeçalhos da aba `data` do template de importação de usuários
 * (ADR 0007 §5). `role` é o **nome** do cargo.
 */
export const USERS_TEMPLATE_HEADERS = [
  'email',
  'name',
  'type',
  'password',
  'phone',
  'document',
  'role',
]

/**
 * Linha de exemplo do template de importação de usuários.
 *
 * @param t Função de tradução da sub-página.
 * @returns Valores da linha de exemplo.
 */
export function getUsersTemplateExample(t: (key: string) => string): string[] {
  return [
    t('example.email'),
    t('example.name'),
    t('example.type'),
    t('example.password'),
    t('example.phone'),
    t('example.document'),
    t('example.role'),
  ]
}
