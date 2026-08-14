// Vitest
import { describe, expect, it, vi } from 'vitest'

// Testing Library
import { act, renderHook } from '@testing-library/react'

// Lib
import { useDebouncedValue } from './use-debounced-value'

describe('useDebouncedValue', () => {
  it('retorna o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 200))
    expect(result.current).toBe('a')
  })

  it('mantém o valor anterior até o atraso passar', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('b')

    vi.useRealTimers()
  })

  it('reinicia o timer quando o valor muda antes do atraso', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 200), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(150))

    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(50))
    expect(result.current).toBe('c')

    vi.useRealTimers()
  })

  it('limpa o timer pendente ao desmontar', () => {
    vi.useFakeTimers()

    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

    const { unmount } = renderHook(() => useDebouncedValue('a', 200))
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()

    vi.useRealTimers()
    clearTimeoutSpy.mockRestore()
  })
})
