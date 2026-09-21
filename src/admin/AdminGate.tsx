import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_PASSWORD_HASH } from '../config/admin'
import { sha256Hex } from '../lib/hash'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { AdminPanel } from './AdminPanel'

const SESSION_KEY = 'muscadeath_admin_authenticated'

export function AdminGate() {
  // Local-only fallback (no Supabase configured): a single shared password.
  const [authenticated, setAuthenticated] = useState(
    () => !isSupabaseConfigured && window.sessionStorage.getItem(SESSION_KEY) === 'true',
  )
  // Real account (Supabase configured): email/password checked server-side.
  const [checkingSession, setCheckingSession] = useState(isSupabaseConfigured)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session))
      setCheckingSession(false)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session))
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (supabase) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) setError('Identifiants incorrects.')
      setPassword('')
      return
    }

    const hash = await sha256Hex(password)
    if (hash === ADMIN_PASSWORD_HASH) {
      window.sessionStorage.setItem(SESSION_KEY, 'true')
      setAuthenticated(true)
    } else {
      setError('Mot de passe incorrect.')
    }
    setPassword('')
  }

  const handleLogout = () => {
    if (supabase) {
      supabase.auth.signOut()
    } else {
      window.sessionStorage.removeItem(SESSION_KEY)
      setAuthenticated(false)
    }
  }

  if (checkingSession) return null

  if (authenticated) {
    return <AdminPanel onLogout={handleLogout} />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8"
      >
        <h1
          style={{ fontFamily: 'var(--font-logo)' }}
          className="text-center text-2xl tracking-wide text-[var(--color-primary)]"
        >
          Administration
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--color-text-muted)]">
          {isSupabaseConfigured
            ? "Connectez-vous avec le compte créé dans Supabase."
            : "Accès réservé à l'équipe du festival (mode local, voir le README)."}
        </p>

        {isSupabaseConfigured && (
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            autoComplete="username"
            className="mt-6 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
        )}
        <input
          type="password"
          autoFocus={!isSupabaseConfigured}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mot de passe"
          autoComplete="current-password"
          className="mt-4 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
        {error && <p className="mt-2 text-sm text-[var(--color-primary)]">{error}</p>}

        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          Se connecter
        </button>

        <Link
          to="/"
          className="mt-4 block text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
        >
          ← Retour au site
        </Link>
      </form>
    </div>
  )
}
