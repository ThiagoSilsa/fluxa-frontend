import { describe, expect, it, vi } from 'vitest'
import { generateQrSvg, openQrPrintWindow } from './qr-code.lib'

describe('generateQrSvg', () => {
  it('gera um SVG a partir do code do QR', async () => {
    const svg = await generateQrSvg('550e8400-e29b-41d4-a716-446655440000')

    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })

  it('gera SVGs determinísticos para o mesmo code', async () => {
    const code = '550e8400-e29b-41d4-a716-446655440000'
    const [first, second] = await Promise.all([generateQrSvg(code), generateQrSvg(code)])

    expect(first).toBe(second)
  })

  it('respeita a largura informada', async () => {
    const svg = await generateQrSvg('code', 512)

    expect(svg).toContain('width="512"')
    expect(svg).toContain('height="512"')
  })
})

describe('openQrPrintWindow', () => {
  it('não lança quando o window.open não abre (popup bloqueado)', () => {
    // Em jsdom, window.open devolve null → caminho de retorno antecipado.
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null)

    expect(() => openQrPrintWindow('<svg />', 'ABC1D23')).not.toThrow()
    openSpy.mockRestore()
  })
})
