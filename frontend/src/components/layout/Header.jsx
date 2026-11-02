import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  LogOut,
  User,
  Settings,
  Command as CommandIcon,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/app/providers/ThemeProvider'
import { useAuth } from '@/app/providers/AuthProvider'
import { initiales } from '@/lib/utils'

export function Header({ onOuvrirSidebar, onOuvrirRecherche }) {
  const { estSombre, basculer } = useTheme()
  const { utilisateur, deconnexion } = useAuth()
  const navigate = useNavigate()
  const [notificationsOuvertes, setNotificationsOuvertes] = useState(false)

  // Raccourci Ctrl+K / ⌘K
  useEffect(() => {
    function surTouche(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOuvrirRecherche()
      }
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [onOuvrirRecherche])

  async function seDeconnecter() {
    await deconnexion()
    navigate('/connexion', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-lg md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOuvrirSidebar} aria-label="Ouvrir le menu">
        <Menu className="h-5 w-5" />
      </Button>

      <Breadcrumb />

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onOuvrirRecherche}
          className="hidden w-64 justify-start gap-2 text-muted-foreground md:flex"
          aria-label="Recherche globale"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left text-xs">Rechercher…</span>
          <kbd className="pointer-events-none flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
            <CommandIcon className="h-2.5 w-2.5" />K
          </kbd>
        </Button>

        <Button variant="ghost" size="icon" onClick={onOuvrirRecherche} className="md:hidden" aria-label="Recherche">
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={basculer}
          aria-label={estSombre ? 'Activer le thème clair' : 'Activer le thème sombre'}
        >
          {estSombre ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu open={notificationsOuvertes} onOpenChange={setNotificationsOuvertes}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1 p-1">
              <div className="rounded-md p-2 hover:bg-muted">
                <p className="text-sm font-medium">Bienvenue sur votre espace</p>
                <p className="text-xs text-muted-foreground">
                  Le tableau de bord est synchronisé avec vos données en temps réel.
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">{formatDate(new Date())}</p>
              </div>
              <div className="rounded-md p-2 hover:bg-muted">
                <p className="text-sm font-medium">Sauvegarde automatique</p>
                <p className="text-xs text-muted-foreground">Vos données sont sauvegardées après chaque action.</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Menu du profil"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} alt="" />
                <AvatarFallback>{initiales(utilisateur?.nom?.split(' ')[0], utilisateur?.nom?.split(' ')[1])}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[120px] truncate text-xs font-semibold leading-tight">{utilisateur?.nom}</span>
                <span className="block text-[10px] capitalize text-muted-foreground">{utilisateur?.role}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block text-sm font-semibold">{utilisateur?.nom}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">{utilisateur?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/parametres')}>
              <User className="h-4 w-4" /> Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/parametres')}>
              <Settings className="h-4 w-4" /> Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={seDeconnecter} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" /> Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
