/** Normaliza a placa — espelho do backend (ADR 0006 §3): trim + uppercase + sem hífen/espaço. */
export function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase().replace(/[\s-]/g, '')
}

/** Valida o formato brasileiro (antigo `ABC1234` ou Mercosul `ABC1D23`). */
export function isValidBrazilianPlate(plate: string): boolean {
  return /^(?:[A-Z]{3}\d{4}|[A-Z]{3}\d[A-Z]\d{2})$/.test(normalizePlate(plate))
}
