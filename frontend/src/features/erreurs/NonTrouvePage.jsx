import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Compass, Home, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NonTrouvePage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <SearchX className="h-8 w-8" />
        </div>
        <p className="mt-6 text-6xl font-extrabold tracking-tight text-primary">404</p>
        <h1 className="mt-2 text-xl font-bold">Page introuvable</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          La page que vous recherchez n'existe pas ou a été déplacée. Vérifiez l'adresse ou revenez au tableau de
          bord.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4" /> Tableau de bord
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/etudiants">
              <Compass className="h-4 w-4" /> Parcourir les étudiants
            </Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Revenir à la page précédente
        </button>
      </motion.div>
    </div>
  )
}
