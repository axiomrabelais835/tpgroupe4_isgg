import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { GlobalSearch } from '@/components/layout/GlobalSearch'

export function AppLayout() {
  const [reduite, setReduite] = useState(() => localStorage.getItem('gf_sidebar_reduite') === '1')
  const [mobileOuverte, setMobileOuverte] = useState(false)
  const [rechercheOuverte, setRechercheOuverte] = useState(false)
  const location = useLocation()

  function basculerReduite() {
    setReduite((valeur) => {
      localStorage.setItem('gf_sidebar_reduite', valeur ? '0' : '1')
      return !valeur
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        reduite={reduite}
        onToggle={basculerReduite}
        mobileOuverte={mobileOuverte}
        onFermerMobile={() => setMobileOuverte(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOuvrirSidebar={() => setMobileOuverte(true)} onOuvrirRecherche={() => setRechercheOuverte(true)} />

        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          Groupe Rabelais — Gestion de formation © {new Date().getFullYear()}
        </footer>
      </div>

      <GlobalSearch ouverte={rechercheOuverte} onOpenChange={setRechercheOuverte} />
    </div>
  )
}
