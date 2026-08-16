// Utils
import { cn } from '#/shared/lib/utils'
import { getInitials } from '#/shared/utils/get-initials'

interface CompanyAvatarProps {
  name: string | null
  className?: string
}

/**
 * Avatar de empresa: círculo com as iniciais do nome.
 */
export function CompanyAvatar({ name, className }: CompanyAvatarProps) {
  return (
    <span
      className={cn(
        'bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name ?? '') || '?'}
    </span>
  )
}
