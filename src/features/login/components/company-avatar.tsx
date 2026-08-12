// Utils
import { cn } from '#/lib/utils'

interface CompanyAvatarProps {
  name: string | null
  className?: string
}

/**
 * Avatar de empresa: círculo com as iniciais do nome.
 */
export function CompanyAvatar({ name, className }: CompanyAvatarProps) {
  const initials = (name ?? '')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      className={cn(
        'bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
        className,
      )}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  )
}
