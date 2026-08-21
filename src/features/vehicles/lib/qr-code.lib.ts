// QRCode
import QRCode from 'qrcode'

/**
 * Gera o QR code do veículo como SVG a partir do `code` (token permanente —
 * ADR 0009 §5).
 *
 * Nenhuma imagem é salva: o SVG é regenerado a cada exibição/impressão; SVG
 * mantém a qualidade em qualquer tamanho.
 *
 * @param code Token permanente do QR (uuid).
 * @param width Largura do QR em pixels (default 220).
 * @returns String SVG do QR code.
 */
export async function generateQrSvg(code: string, width = 220): Promise<string> {
  return QRCode.toString(code, {
    type: 'svg',
    margin: 1,
    width,
    color: { dark: '#000000ff', light: '#ffffffff' },
  })
}

/**
 * Abre uma janela de impressão limpa com o QR + a identificação do veículo
 * (placa) e dispara `print()` ao carregar.
 *
 * @param svg SVG do QR code.
 * @param title Identificação exibida abaixo do QR (ex.: placa).
 */
export function openQrPrintWindow(svg: string, title: string): void {
  const win = window.open('', '_blank', 'width=420,height=560')
  if (!win) {
    return
  }

  win.document.write(
    `<!doctype html><html><head><title>QR code — ${title}</title></head>` +
      `<body style="margin:0;min-height:100vh;display:flex;flex-direction:column;` +
      `align-items:center;justify-content:center;font-family:sans-serif;gap:16px">` +
      `<div>${svg}</div>` +
      `<p style="margin:0;font-size:26px;font-weight:700;letter-spacing:3px">${title}</p>` +
      `<script>window.onload = () => { window.focus(); window.print(); }</script>` +
      `</body></html>`,
  )
  win.document.close()
}
