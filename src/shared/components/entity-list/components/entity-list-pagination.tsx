// Icons
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'

// Types
import type { EntityListPaginationViewProps } from '../types/entity-list.types'

// Components
import { Button } from '#/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/components/ui/select'

const limitOptions = [10, 20, 30, 50]

/**
 * Paginação server-side por `offset`/`limit` — modelo nativo de APIs REST.
 * Oculta quando `total === 0`.
 */
export function EntityListPagination({
  total,
  limit,
  offset,
  onLimitChange,
  onOffsetChange,
  labels,
}: EntityListPaginationViewProps) {
  if (total === 0) {
    return null
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const currentPage = Math.floor(offset / limit) + 1
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= totalPages

  const handleFirst = () => onOffsetChange(0)
  const handlePrevious = () => onOffsetChange(Math.max(0, offset - limit))
  const handleNext = () => onOffsetChange(Math.min((totalPages - 1) * limit, offset + limit))
  const handleLast = () => onOffsetChange((totalPages - 1) * limit)

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">{labels.limit}</span>
        <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
          <SelectTrigger className="w-21">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {limitOptions.map((option) => (
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
