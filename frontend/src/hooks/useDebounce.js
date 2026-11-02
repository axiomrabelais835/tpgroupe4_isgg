import { useEffect, useState } from 'react'

/** Retourne une valeur retardée (debounce). */
export function useDebounce(valeur, delai = 350) {
  const [retardee, setRetardee] = useState(valeur)

  useEffect(() => {
    const timer = setTimeout(() => setRetardee(valeur), delai)
    return () => clearTimeout(timer)
  }, [valeur, delai])

  return retardee
}
