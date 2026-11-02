import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Logos de la marque, en SVG inline pour s'adapter au thème clair / sombre.
 * - `LogoIcone` : pictogramme seul (barre latérale réduite, favicon, badges)
 * - `Logo` : version horizontale complète (connexion, en-têtes)
 *
 * Le texte utilise `currentColor` : la couleur est héritée du contexte
 * (`text-foreground`, `text-primary-foreground`…).
 */
function useIdentifiantDegrade() {
  return `gf-logo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}

export function LogoIcone({ className, ...props }) {
  const degrade = useIdentifiantDegrade()

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Gestion de formation"
      className={cn('shrink-0', className)}
      {...props}
    >
      <defs>
        <linearGradient id={degrade} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${degrade})`} />
      <path d="M19 31v8c0 4.5 5.8 8 13 8s13-3.5 13-8v-8l-13 6z" fill="#fff" fillOpacity=".88" />
      <polygon points="32,13 56,25 32,37 8,25" fill="#fff" />
      <line x1="53" y1="26.5" x2="53" y2="40" stroke="#FBBF24" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="53" cy="42.5" r="3" fill="#FBBF24" />
    </svg>
  )
}

export function Logo({ className, ...props }) {
  const degrade = useIdentifiantDegrade()

  return (
    <svg
      viewBox="0 0 330 80"
      role="img"
      aria-label="Gestion de formation"
      className={cn('shrink-0', className)}
      {...props}
    >
      <defs>
        <linearGradient id={degrade} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <g transform="translate(4 4) scale(1.1875)">
        <rect width="64" height="64" rx="16" fill={`url(#${degrade})`} />
        <path d="M19 31v8c0 4.5 5.8 8 13 8s13-3.5 13-8v-8l-13 6z" fill="#fff" fillOpacity=".88" />
        <polygon points="32,13 56,25 32,37 8,25" fill="#fff" />
        <line x1="53" y1="26.5" x2="53" y2="40" stroke="#FBBF24" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="53" cy="42.5" r="3" fill="#FBBF24" />
      </g>

      <text
        x="96"
        y="44"
        fontFamily="'Plus Jakarta Sans','Inter','Segoe UI',Arial,sans-serif"
        fontSize="32"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        Gestion
      </text>
      <text
        x="97"
        y="66"
        fontFamily="'Plus Jakarta Sans','Inter','Segoe UI',Arial,sans-serif"
        fontSize="19"
        fontWeight="500"
        fill="currentColor"
        fillOpacity=".68"
        letterSpacing="1.2"
      >
        de formation
      </text>
    </svg>
  )
}
