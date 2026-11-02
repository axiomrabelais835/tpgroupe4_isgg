import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stocke = localStorage.getItem('gf_theme')
    if (stocke === 'light' || stocke === 'dark') return stocke
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const racine = document.documentElement
    racine.classList.toggle('dark', theme === 'dark')
    racine.style.colorScheme = theme
    localStorage.setItem('gf_theme', theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      estSombre: theme === 'dark',
      basculer: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      definir: setTheme,
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const contexte = useContext(ThemeContext)
  if (!contexte) throw new Error('useTheme doit être utilisé dans ThemeProvider')
  return contexte
}
