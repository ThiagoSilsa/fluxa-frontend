/**
 * Cabeçalhos da aba `data` do template de importação de vínculo
 * usuário-veículo (ADR 0007 §5). Referências por chave natural: placa e
 * e-mail.
 */
export const USER_VEHICLES_TEMPLATE_HEADERS = ['vehiclePlate', 'userEmail', 'isPrimary', 'canDrive']

/**
 * Linha de exemplo do template de importação de vínculo usuário-veículo.
 *
 * @param t Função de tradução da sub-página.
 * @returns Valores da linha de exemplo.
 */
export function getUserVehiclesTemplateExample(t: (key: string) => string): string[] {
  return [
    t('example.vehiclePlate'),
    t('example.userEmail'),
    t('example.isPrimary'),
    t('example.canDrive'),
  ]
}
