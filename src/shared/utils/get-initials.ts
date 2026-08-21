export function getInitials(name?: string): string {
  if (!name?.trim()) {
    return ''
  }

  const ignored = new Set(['da', 'de', 'do', 'dos', 'das'])

  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => !ignored.has(part.toLowerCase()))

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ''}`.toUpperCase()
}
