// Vitest
import { describe, expect, it, vi } from 'vitest'

// Lib
import { createPaginatedFetcher } from './build-dynamic-template.lib'

describe('createPaginatedFetcher', () => {
  it('busca todas as páginas até a última incompleta', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ data: [1, 2] })
      .mockResolvedValueOnce({ data: [3] })

    const all = await createPaginatedFetcher<number>(fetcher, 2)()

    expect(all).toEqual([1, 2, 3])
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher).toHaveBeenNthCalledWith(1, 2, 0)
    expect(fetcher).toHaveBeenNthCalledWith(2, 2, 2)
  })

  it('para quando a página vem cheia e a seguinte é vazia', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({ data: [1, 2] })
      .mockResolvedValueOnce({ data: [] })

    const all = await createPaginatedFetcher<number>(fetcher, 2)()

    expect(all).toEqual([1, 2])
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('devolve [] quando a primeira página é vazia', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: [] })

    const all = await createPaginatedFetcher<number>(fetcher)()

    expect(all).toEqual([])
  })
})
