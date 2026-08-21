/**
 * Cabeçalhos da aba `data` do template de importação de departamentos
 * (ADR 0007 §5).
 */
export const DEPARTMENTS_TEMPLATE_HEADERS = ['name', 'parkingSpace', 'description']

/**
 * Linha de exemplo do template de importação de departamentos.
 *
 * @param t Função de tradução da sub-página.
 * @returns Valores da linha de exemplo.
 */
export function getDepartmentsTemplateExample(t: (key: string) => string): string[] {
  return [t('example.name'), t('example.parkingSpace'), t('example.description')]
}
