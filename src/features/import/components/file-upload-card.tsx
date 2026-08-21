// React
import { useRef, useState } from 'react'

// Icons
import { FileText, Loader2, Upload, X } from 'lucide-react'

// i18n
import { useTranslation } from 'react-i18next'

// Types
import type { ReactNode } from 'react'
import type { DownloadTemplateConfig } from '../types/import.types'

// Lib
import { downloadWorkbook } from '../lib/spreadsheet.lib'

// Components
import { Button, Card, CardContent, CardHeader, CardTitle } from '#/shared/components'

/** Limite máximo de upload (alinhado ao backend — ADR 0007 §6). */
const MAX_FILE_SIZE = 50 * 1024 * 1024

/**
 * Card de upload de planilha XLSX (genérico — reutilizado por todos os
 * recursos de importação).
 *
 * Valida localmente extensão `.xlsx` e tamanho ≤ 50MB, aceita clique e
 * drag-and-drop, e oferece download do template (síncrono via config ou
 * assíncrono via handler).
 *
 * @param props Propriedades do card.
 */
export function FileUploadCard({
  onUpload,
  isPending,
  title,
  description,
  downloadTemplate,
  onDownloadTemplate,
}: {
  /** Callback disparado com o arquivo selecionado. */
  onUpload: (file: File) => void
  /** Se o upload está em andamento. */
  isPending: boolean
  /** Título do card. */
  title: ReactNode
  /** Descrição do card. */
  description: ReactNode
  /** Config de template estática (download síncrono). */
  downloadTemplate?: DownloadTemplateConfig
  /** Handler assíncrono de download do template. */
  onDownloadTemplate?: () => Promise<void>
}) {
  const { t } = useTranslation('import')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = (selectedFile: File): void => {
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
    const isValidExt = fileExtension === 'xlsx'
    const isValidSize = selectedFile.size <= MAX_FILE_SIZE

    if (!isValidExt) {
      setError(t('validation.file-extension'))
      setFile(null)
      return
    }

    if (!isValidSize) {
      setError(t('validation.file-too-large'))
      setFile(null)
      return
    }

    setError(null)
    setFile(selectedFile)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) {
      return
    }
    processFile(selected)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (!droppedFile) {
      return
    }
    processFile(droppedFile)
  }

  const handleUpload = () => {
    if (!file) {
      return
    }
    onUpload(file)
  }

  const handleDownloadTemplate = async () => {
    if (onDownloadTemplate) {
      await onDownloadTemplate()
      return
    }
    if (!downloadTemplate) {
      return
    }

    await downloadWorkbook(
      downloadTemplate.sheets.map((sheet) => ({
        name: sheet.name,
        rows:
          sheet.rows ??
          (sheet.headers
            ? sheet.exampleRow
              ? [sheet.headers, sheet.exampleRow]
              : [sheet.headers]
            : []),
      })),
      downloadTemplate.filename,
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {(downloadTemplate || onDownloadTemplate) && (
          <Button variant="outline" onClick={handleDownloadTemplate}>
            {t('upload.download-template')}
          </Button>
        )}

        <div
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          className="rounded-lg border-2 border-dashed p-8 text-center"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            {t('upload.select-file')}
          </Button>

          {file && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null)
                  if (inputRef.current) {
                    inputRef.current.value = ''
                  }
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        </div>

        <Button onClick={handleUpload} disabled={!file || isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {t('upload.submit')}
        </Button>
      </CardContent>
    </Card>
  )
}
