/** Uma aba do arquivo. A primeira linha é o cabeçalho. */
export type SheetSpec = {
  name: string
  rows: unknown[][]
}

/**
 * Converte objetos em linhas, com o cabeçalho na primeira.
 *
 * @param items Registros a converter.
 * @param headers Ordem das colunas (default: união das chaves na ordem).
 * @returns Linhas prontas para a planilha.
 */
export function rowsFromObjects(items: Record<string, unknown>[], headers?: string[]): unknown[][] {
  const keys = headers ?? [...new Set(items.flatMap((item) => Object.keys(item)))]
  return [keys, ...items.map((item) => keys.map((key) => item[key] ?? ''))]
}

/**
 * Monta o arquivo XLSX e devolve os bytes (import dinâmico do ExcelJS para
 * não inflar o bundle inicial).
 *
 * @param sheets Abas do arquivo (nome + linhas).
 * @returns Blob do arquivo XLSX.
 */
export async function buildWorkbook(sheets: SheetSpec[]): Promise<Blob> {
  const { Workbook } = await import('exceljs')
  const workbook = new Workbook()

  for (const sheet of sheets) {
    // O Excel recusa nome de aba com mais de 31 caracteres e com `[]:*?/\`
    const worksheet = workbook.addWorksheet(sanitizeSheetName(sheet.name))
    for (const row of sheet.rows) {
      worksheet.addRow(row)
    }
  }

  return new Blob([await workbook.xlsx.writeBuffer()], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/**
 * Dispara o download de um Blob.
 *
 * @param blob Conteúdo do arquivo.
 * @param fileName Nome do arquivo de download.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Sem revogar, o Blob fica preso na memória até o reload
  URL.revokeObjectURL(url)
}

/**
 * Monta o arquivo e dispara o download.
 *
 * @param sheets Abas do arquivo.
 * @param fileName Nome do arquivo de download.
 */
export async function downloadWorkbook(sheets: SheetSpec[], fileName: string): Promise<void> {
  downloadBlob(await buildWorkbook(sheets), fileName)
}

/**
 * Sanitiza o nome de uma aba para o Excel (≤ 31 chars e sem `[]:*?/\`).
 *
 * @param name Nome original da aba.
 * @returns Nome seguro para o Excel.
 */
export function sanitizeSheetName(name: string): string {
  return name.replace(/[[\]:*?/\\]/g, '-').slice(0, 31)
}
