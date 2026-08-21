/**
 * Cria um fetcher paginado que busca TODAS as páginas de um recurso da API
 * (para abas de referência do template — ex.: tipos de veículo).
 *
 * @param fetcher Função que busca uma página (limit/offset).
 * @param pageSize Tamanho de cada página (default 200).
 * @returns Função que devolve todos os registros do recurso.
 */
export function createPaginatedFetcher<T>(
  fetcher: (limit: number, offset: number) => Promise<{ data: T[] }>,
  pageSize = 200,
) {
  return async (): Promise<T[]> => {
    const all: T[] = []
    let offset = 0

    while (true) {
      const page = await fetcher(pageSize, offset)
      all.push(...page.data)
      if (page.data.length < pageSize) {
        break
      }
      offset += pageSize
    }

    return all
  }
}
