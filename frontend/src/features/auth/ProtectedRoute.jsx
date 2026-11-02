import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'

export function ProtectedRoute() {
  const { estConnecte, chargement } = useAuth()
  const location = useLocation()

  if (chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Chargement de votre espace…</p>
        </div>
      </div>
    )
  }

  if (!estConnecte) {
    return <Navigate to="/connexion" replace state={{ from: location }} />
  }

  return <Outlet />
}
