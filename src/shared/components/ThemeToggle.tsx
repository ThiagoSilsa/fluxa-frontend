import { useEffect, useState } from 'react'

// Icons
import { GoMoon, GoSun } from 'react-icons/go'

type ThemeMode = 'light' | 'dark'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = window.localStorage.getItem('theme')

  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return 'light'
}

function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(mode)

  document.documentElement.setAttribute('data-theme', mode)
  document.documentElement.style.colorScheme = mode
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    const initialMode = getInitialMode()

    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  function toggleMode() {
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : 'light'

    setMode(nextMode)
    applyThemeMode(nextMode)

    window.localStorage.setItem('theme', nextMode)
  }

  const isDark = mode === 'dark'

  const label = isDark
    ? 'Tema escuro. Clique para mudar para o tema claro.'
    : 'Tema claro. Clique para mudar para o tema escuro.'

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="border-muted-foreground relative flex h-9 w-16 cursor-pointer items-center rounded-full border bg-[var(--chip-bg)] p-1 transition-colors"
    >
      <span
        className={`bg-primary flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm transition-transform ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? <GoMoon /> : <GoSun />}
      </span>
    </button>
  )
}
