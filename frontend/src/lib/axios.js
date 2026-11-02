import axios from 'axios'

const STORAGE_KEY = 'gf_token'

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { Accept: 'application/json' },
  timeout: 30000,
})

export function getToken() {
  return localStorage.getItem(STORAGE_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(STORAGE_KEY, token)
  else localStorage.removeItem(STORAGE_KEY)
}

// Intercepteur requête : ajoute le token Bearer
axiosClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur réponse : normalise les erreurs et gère l'expiration du token
axiosClient.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    const statut = erreur.response?.status
    const url = erreur.config?.url ?? ''
    const estConnexion = url.includes('/auth/connexion')

    // Ne jamais invalider un jeton fraîchement obtenu : on ne nettoie que si
    // la requête en échec a utilisé le jeton actuellement stocké.
    const entetes = erreur.config?.headers
    const autorisation =
      typeof entetes?.get === 'function' ? entetes.get('Authorization') : entetes?.Authorization
    const jetonUtilise = typeof autorisation === 'string' ? autorisation.replace(/^Bearer\s+/i, '') : null
    const jetonCourant = getToken()

    if (
      statut === 401 &&
      !estConnexion &&
      jetonCourant &&
      (!jetonUtilise || jetonUtilise === jetonCourant)
    ) {
      setToken(null)
      // Évite une boucle si déjà sur la page de connexion
      if (!window.location.pathname.startsWith('/connexion')) {
        window.dispatchEvent(new CustomEvent('auth:expired'))
      }
    }

    const donnees = erreur.response?.data
    const message =
      donnees?.message ||
      (statut === 422 ? 'Certaines informations sont invalides.' : 'Une erreur est survenue.')

    return Promise.reject(
      Object.assign(erreur, {
        message,
        erreurs: donnees?.erreurs ?? null,
        statut,
      })
    )
  }
)
