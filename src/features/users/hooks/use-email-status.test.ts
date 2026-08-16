import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEmailStatus } from './use-email-status'

import type { ReactNode } from 'react'

// Mock do service
const mockEmailStatus = vi.fn()
vi.mock('../services/user.service', () => ({
  usersService: { emailStatus: (...args: unknown[]) => mockEmailStatus(...args) },
}))

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

/** Avança o debounce e dá flush nas microtasks do React Query. */
async function flushDebounce() {
  act(() => {
    vi.advanceTimersByTime(600)
  })
  await act(async () => {})
  await act(async () => {})
}

// ---------------------------------------------------------------------------
// useEmailStatus
// ---------------------------------------------------------------------------
describe('useEmailStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not query before the debounce', () => {
    const { result } = renderHook(() => useEmailStatus('maria@somar.local'), {
      wrapper: createQueryWrapper(),
    })

    expect(mockEmailStatus).not.toHaveBeenCalled()
    expect(result.current.exists).toBe(false)
    expect(result.current.isChecking).toBe(false)
  })

  it('should query after the debounce with the normalized email', async () => {
    mockEmailStatus.mockResolvedValue({ exists: true })

    const { result } = renderHook(() => useEmailStatus('  Maria@Somar.Local '), {
      wrapper: createQueryWrapper(),
    })

    await flushDebounce()

    expect(mockEmailStatus).toHaveBeenCalledWith('maria@somar.local')
    await vi.waitFor(() => expect(result.current.exists).toBe(true))
  })

  it('should not query for invalid format', async () => {
    const { result } = renderHook(() => useEmailStatus('nao-e-email'), {
      wrapper: createQueryWrapper(),
    })

    await flushDebounce()

    expect(mockEmailStatus).not.toHaveBeenCalled()
    expect(result.current.exists).toBe(false)
  })

  it('should not query when disabled', async () => {
    renderHook(() => useEmailStatus('maria@somar.local', false), {
      wrapper: createQueryWrapper(),
    })

    await flushDebounce()

    expect(mockEmailStatus).not.toHaveBeenCalled()
  })
})
