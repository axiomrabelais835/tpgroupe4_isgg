import { NavLink } from 'react-router-dom'
import { ChevronsLeft, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { navigation, navigationSecondaire } from '@/config/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Logo, LogoIcone } from '@/components/brand/Logo'

function LienNavigation({ item, reduite, onNavigate }) {
  const Icone = item.icone
  const lien = (
    <NavLink
      to={item.chemin}
      end={item.chemin === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          reduite && 'justify-center px-2'
        )
      }
    >
      <Icone className="h-[18px] w-[18px] shrink-0" />
      {!reduite && <span className="truncate">{item.libelle}</span>}
    </NavLink>
  )

  if (!reduite) return lien

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{lien}</TooltipTrigger>
      <TooltipContent side="right">{item.libelle}</TooltipContent>
    </Tooltip>
  )
}

export function Sidebar({ reduite, onToggle, mobileOuverte, onFermerMobile }) {
  const contenu = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className={cn('flex min-w-0 items-center', reduite && 'flex-1 justify-center')}>
          {reduite ? (
            <LogoIcone className="h-9 w-9" />
          ) : (
            <Logo className="h-9 w-auto max-w-[168px] text-foreground" />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto shrink-0 lg:hidden"
          onClick={onFermerMobile}
          aria-label="Fermer le menu"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navigation principale">
        {navigation.map((item) => (
          <LienNavigation key={item.chemin} item={item} reduite={reduite} onNavigate={onFermerMobile} />
        ))}

        <div className="my-3 h-px bg-border" />

        {navigationSecondaire.map((item) => (
          <LienNavigation key={item.chemin} item={item} reduite={reduite} onNavigate={onFermerMobile} />
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn('w-full justify-start gap-2 text-muted-foreground', reduite && 'justify-center')}
          aria-label={reduite ? 'Déployer le menu' : 'Réduire le menu'}
        >
          <ChevronsLeft className={cn('h-4 w-4 transition-transform duration-300', reduite && 'rotate-180')} />
          {!reduite && <span>Réduire</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: reduite ? 76 : 264 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="sticky top-0 hidden h-screen shrink-0 border-r border-border bg-card lg:block"
      >
        {contenu}
      </motion.aside>

      {/* Mobile */}
      {mobileOuverte && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onFermerMobile} aria-hidden="true" />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="relative h-full w-[264px] border-r border-border bg-card shadow-2xl"
          >
            {contenu}
          </motion.aside>
        </div>
      )}
    </>
  )
}
