import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/api'
import { getToken, setToken } from '@/lib/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [utilisateur, setUtilisateur] = useState(null)
  const [chargement, setChargement] = useState(Boolean(getToken()))

  // Restaure la session au démarrage
  useEffect(() => {
    let annule = false

    async function restaurer() {
      if (!getToken()) {
        setChargement(false)
        return
      }
      try {
        const profil = await authService.moi()
        if (!annule) setUtilisateur(profil)
      } catch {
        setToken(null)
      } finally {
        if (!annule) setChargement(false)
      }
    }

    restaurer()
    return () => {
      annule = true
    }
  }, [])

  // Expiration du token détectée par Axios
  useEffect(() => {
    function surExpiration() {
      setToken(null)
      setUtilisateur(null)
      queryClient.clear()
    }
    window.addEventListener('auth:expired', surExpiration)
    return () => window.removeEventListener('auth:expired', surExpiration)
  }, [queryClient])

  const connexion = useCallback(
    async (identifiants) => {
      const reponse = await authService.connexion(identifiants)
      setToken(reponse.token)
      setUtilisateur(reponse.utilisateur.data ?? reponse.utilisateur)
      return reponse
    },
    []
  )

  const deconnexion = useCallback(async () => {
    try {
      await authService.deconnexion()
    } catch {
      // Le token peut déjà être expiré
    } finally {
      setToken(null)
      setUtilisateur(null)
      queryClient.clear()
    }
  }, [queryClient])

  const value = useMemo(
    () => ({
      utilisateur,
      estConnecte: Boolean(utilisateur),
      chargement,
      connexion,
      deconnexion,
    }),
    [utilisateur, chargement, connexion, deconnexion]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexte = useContext(AuthContext)
  if (!contexte) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return contexte
}
