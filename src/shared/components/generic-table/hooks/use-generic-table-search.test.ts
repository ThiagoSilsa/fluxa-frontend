import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGenericTableSearch } from './use-generic-table-search'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

type SearchParams = {
  limit?: number
  offset?: number
  name?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

const DEFAULT_PATH = '/management/roles'

function resolveNavigatedSearch(previous: SearchParams): SearchParams {
  const navigateArg = mockNavigate.mock.calls[0][0]
  return navigateArg.search(previous) as SearchParams
}

// ---------------------------------------------------------------------------
// useGenericTableSearch
// ---------------------------------------------------------------------------
describe('useGenericTableSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Initial state ───────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should derive pageIndex and pageSize from search params', () => {
      const search: SearchParams = { limit: 20, offset: 40 }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      expect(result.current.limit).toBe(20)
      expect(result.current.offset).toBe(40)
      expect(result.current.pageSize).toBe(20)
      expect(result.current.pageIndex).toBe(2) // 40 / 20 = 2
    })

    it('should default pageSize to 10 when limit is not provided', () => {
      const search: SearchParams = {}
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      expect(result.current.pageSize).toBe(10)
      expect(result.current.pageIndex).toBe(0)
    })

    it('should set sorting to empty array when sortBy/sortOrder are missing', () => {
      const search: SearchParams = {}
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      expect(result.current.sorting).toEqual([])
    })

    it('should derive sorting state from sortBy and sortOrder', () => {
      const search: SearchParams = { sortBy: 'name', sortOrder: 'DESC' }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      expect(result.current.sorting).toEqual([{ id: 'name', desc: true }])
    })

    it('should derive sorting with desc=false for asc order', () => {
      const search: SearchParams = { sortBy: 'weight', sortOrder: 'ASC' }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      expect(result.current.sorting).toEqual([{ id: 'weight', desc: false }])
    })
  })

  // ─── updateSearch ────────────────────────────────────────────────────────

  describe('updateSearch', () => {
    it('should navigate with merged params and reset offset to 0', () => {
      const search: SearchParams = { limit: 10, offset: 40, name: 'original' }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      act(() => {
        result.current.updateSearch({ name: 'updated' })
      })

      expect(mockNavigate).toHaveBeenCalledTimes(1)
      expect(mockNavigate.mock.calls[0][0].to).toBe(DEFAULT_PATH)

      const resolved = resolveNavigatedSearch({ limit: 10, offset: 40, name: 'original' })
      expect(resolved).toEqual({ limit: 10, offset: 0, name: 'updated' })
    })

    it('should clean undefined and empty values from search params', () => {
      const search: SearchParams = { limit: 10, offset: 20, name: 'test' }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      act(() => {
        result.current.updateSearch({ name: '', isActive: undefined })
      })

      const resolved = resolveNavigatedSearch({ limit: 10, offset: 20, name: 'test' })
      expect(resolved).toEqual({ limit: 10, offset: 0 })
      expect(resolved).not.toHaveProperty('name')
      expect(resolved).not.toHaveProperty('isActive')
    })
  })

  // ─── updatePagination ────────────────────────────────────────────────────

  describe('updatePagination', () => {
    it('should navigate with merged params WITHOUT resetting offset', () => {
      const search: SearchParams = { limit: 10, offset: 20 }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      act(() => {
        result.current.updatePagination({ isActive: true })
      })

      const resolved = resolveNavigatedSearch({ limit: 10, offset: 20 })
      expect(resolved).toEqual({ limit: 10, offset: 20, isActive: true })
    })

    it('should update offset via updateOffset', () => {
      const search: SearchParams = { limit: 10, offset: 0 }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      act(() => {
        result.current.updateOffset(30)
      })

      const resolved = resolveNavigatedSearch({ limit: 10, offset: 0 })
      expect(resolved).toEqual({ limit: 10, offset: 30 })
    })

    it('should update limit and reset offset via updateLimit', () => {
      const search: SearchParams = { limit: 10, offset: 20 }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      act(() => {
        result.current.updateLimit(30)
      })

      const resolved = resolveNavigatedSearch({ limit: 10, offset: 20 })
      expect(resolved).toEqual({ limit: 30, offset: 0 })
    })
  })

  // ─── Page handlers ───────────────────────────────────────────────────────

  describe('page handlers', () => {
    it('should compute offset from page index via onPageChange', () => {
      const search: SearchParams = { limit: 20, offset: 0 }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      act(() => {
        result.current.onPageChange(3)
      })

      const resolved = resolveNavigatedSearch({ limit: 20, offset: 0 })
      expect(resolved).toEqual({ limit: 20, offset: 60 })
    })

    it('should set limit and reset offset via onPageSizeChange', () => {
      const search: SearchParams = { limit: 20, offset: 40 }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      act(() => {
        result.current.onPageSizeChange(50)
      })

      const resolved = resolveNavigatedSearch({ limit: 20, offset: 40 })
      expect(resolved).toEqual({ limit: 50, offset: 0 })
    })
  })

  // ─── Sorting handler ─────────────────────────────────────────────────────

  describe('onSortingChange', () => {
    it('should write sortBy/sortOrder and reset offset', () => {
      const search: SearchParams = { limit: 10, offset: 20 }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      act(() => {
        result.current.onSortingChange([{ id: 'name', desc: true }])
      })

      const resolved = resolveNavigatedSearch({ limit: 10, offset: 20 })
      expect(resolved).toEqual({ limit: 10, offset: 0, sortBy: 'name', sortOrder: 'DESC' })
    })

    it('should clear sortBy/sortOrder when sorting is removed', () => {
      const search: SearchParams = { sortBy: 'name', sortOrder: 'DESC' }
      const { result } = renderHook(() =>
        useGenericTableSearch<SearchParams>({ path: DEFAULT_PATH, search }),
      )

      act(() => {
        result.current.onSortingChange([])
      })

      const resolved = resolveNavigatedSearch({ sortBy: 'name', sortOrder: 'DESC' })
      expect(resolved).not.toHaveProperty('sortBy')
      expect(resolved).not.toHaveProperty('sortOrder')
    })
  })
})
