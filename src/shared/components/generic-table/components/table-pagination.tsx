// Icons
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

// Types
import type { TablePaginationProps } from '../types/generic-table.types'

// Components
import { Button } from '#/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components/ui/select'

const pageSizeOptions = [10, 20, 30, 50]

/**
 * Paginação server-side no modelo `pageIndex`/`pageSize` (padrão TanStack
 * Table). Oculta quando `total === 0`.
 */
export function TablePagination({
  total,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  labels,
}: TablePaginationProps) {
  if (total === 0) {
    return null
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = pageIndex + 1
  const isFirstPage = pageIndex <= 0
  const isLastPage = pageIndex >= totalPages - 1

  const handleFirst = () => onPageChange(0)
  const handlePrevious = () => onPageChange(Math.max(0, pageIndex - 1))
  const handleNext = () => onPageChange(Math.min(totalPages - 1, pageIndex + 1))
  const handleLast = () => onPageChange(totalPages - 1)

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{labels.limit}</span>
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-21">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-9 w-9"
          onClick={handleFirst}
          disabled={isFirstPage}
          aria-label={labels.first}
        >
          <ChevronsLeft />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-9 w-9"
          onClick={handlePrevious}
          disabled={isFirstPage}
          aria-label={labels.previous}
        >
          <ChevronLeft />
        </Button>
        <div className="text-muted-foreground px-2 text-sm">
          {currentPage}/{totalPages}
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-9 w-9"
          onClick={handleNext}
          disabled={isLastPage}
          aria-label={labels.next}
        >
          <ChevronRight />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-9 w-9"
          onClick={handleLast}
          disabled={isLastPage}
          aria-label={labels.last}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  )
}
