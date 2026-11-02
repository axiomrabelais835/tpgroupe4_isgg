import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { libelleRoute } from '@/config/navigation'

export function Breadcrumb() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  const miettes = [{ libelle: 'Accueil', chemin: '/' }]
  segments.forEach((segment, index) => {
    const chemin = `/${segments.slice(0, index + 1).join('/')}`
    miettes.push({ libelle: libelleRoute(chemin), chemin })
  })

  return (
    <nav aria-label="Fil d'Ariane" className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
      <Link to="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {miettes.slice(1).map((miette, index) => (
        <span key={miette.chemin} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          {index === miettes.length - 2 ? (
            <span className="font-medium text-foreground">{miette.libelle}</span>
          ) : (
            <Link to={miette.chemin} className="transition-colors hover:text-foreground">
              {miette.libelle}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
