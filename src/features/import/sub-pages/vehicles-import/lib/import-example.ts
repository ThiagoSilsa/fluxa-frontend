/**
 * Cabeçalhos da aba `data` do template de importação de veículos
 * (ADR 0007 §5). `vehicleType` é o **código** do tipo (ex.: `FROTA`).
 */
export const VEHICLES_TEMPLATE_HEADERS = [
  'plate',
  'vehicleType',
  'model',
  'color',
  'observation',
  'freePass',
  'department',
]

/**
 * Linha de exemplo do template de importação de veículos.
 *
 * @param t Função de tradução da sub-página.
 * @returns Valores da linha de exemplo.
 */
export function getVehiclesTemplateExample(t: (key: string) => string): string[] {
  return [
    t('example.plate'),
    t('example.vehicleType'),
    t('example.model'),
    t('example.color'),
    t('example.observation'),
    t('example.freePass'),
    t('example.department'),
  ]
}
