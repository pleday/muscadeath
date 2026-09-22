import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'
import { useSiteConfig } from '../context/useSiteConfig'
import { AdvancedTab } from './AdvancedTab'
import { ContentTab } from './ContentTab'
import { GalleryTab } from './GalleryTab'
import { HistoriqueTab } from './HistoriqueTab'
import { LineupTab } from './LineupTab'
import { MediaLibraryTab } from './MediaLibraryTab'
import { MerchTab } from './MerchTab'
import { NewsTab } from './NewsTab'
import { PartnersTab } from './PartnersTab'
import { StatsTab } from './StatsTab'
import { ThemeTab } from './ThemeTab'

const tabs = [
  { id: 'content', label: 'Général' },
  { id: 'news', label: 'Actualités' },
  { id: 'lineup', label: 'Programmation' },
  { id: 'historique', label: 'Historique(s)' },
  { id: 'merch', label: 'Boutique' },
  { id: 'gallery', label: 'Galerie' },
  { id: 'partners', label: 'Partenaires' },
  { id: 'media', label: 'Médiathèque' },
  { id: 'stats', label: 'Statistiques' },
  { id: 'theme', label: 'Couleurs' },
  { id: 'advanced', label: 'Avancé' },
] as const

type TabId = (typeof tabs)[number]['id']

const tabGroups: { label: string; ids: TabId[] }[] = [
  { label: 'Contenu', ids: ['content', 'news', 'lineup', 'historique'] },
  { label: 'Boutique & médias', ids: ['merch', 'gallery', 'partners', 'media'] },
  { label: 'Site', ids: ['stats', 'theme', 'advanced'] },
]

interface AdminPanelProps {
  onLogout: () => void
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const { resetAll, exportJson, publish, cloudStatus, storageWarning } = useSiteConfig()
  const [activeTab, setActiveTab] = useState<TabId>('content')
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'done' | 'error'>('idle')
  const [publishError, setPublishError] = useState('')

  const handleExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'muscadeath-config.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    if (window.confirm('Réinitialiser tout le contenu et les couleurs par défaut ?')) {
      resetAll()
    }
  }

  const handlePublish = async () => {
    setPublishState('publishing')
    setPublishError('')
    const result = await publish()
    if (result.ok) {
      setPublishState('done')
      setTimeout(() => setPublishState('idle'), 2000)
    } else {
      setPublishState('error')
      setPublishError(result.error ?? 'Erreur inconnue.')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p style={{ fontFamily: 'var(--font-logo)' }} className="text-xl text-[var(--color-primary)]">
              Administration
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {isSupabaseConfigured
                ? "Modifiez puis cliquez sur « Publier en ligne » pour que tous les visiteurs voient le changement."
                : "Mode local : les modifications ne s'appliquent que dans ce navigateur (voir le README pour publier en ligne)."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishState === 'publishing'}
                className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
              >
                {publishState === 'publishing'
                  ? 'Publication...'
                  : publishState === 'done'
                    ? 'Publié ✓'
                    : 'Publier en ligne'}
              </button>
            )}
            <Link
              to="/"
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
            >
              Voir le site
            </Link>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
            >
              Exporter
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
            >
              Réinitialiser
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)]"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        {publishState === 'error' && (
          <p className="mx-auto max-w-5xl px-6 pb-2 text-xs text-[var(--color-primary)]">
            Échec de la publication : {publishError}
          </p>
        )}
        {cloudStatus === 'error' && publishState === 'idle' && (
          <p className="mx-auto max-w-5xl px-6 pb-2 text-xs text-[var(--color-primary)]">
            Impossible de récupérer le contenu publié depuis Supabase. Vérifiez la configuration
            (voir supabase/schema.sql et le README).
          </p>
        )}
        {storageWarning && (
          <p className="mx-auto max-w-5xl px-6 pb-2 text-xs text-[var(--color-primary)]">{storageWarning}</p>
        )}

        <nav className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-2 px-6 pb-3">
          {tabGroups.map((group) => (
            <div key={group.label} className="flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-[10px] font-semibold tracking-wide text-[var(--color-text-muted)] uppercase opacity-70">
                {group.label}
              </span>
              {group.ids.map((id) => {
                const tab = tabs.find((candidate) => candidate.id === id)!
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={
                      'rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors ' +
                      (activeTab === tab.id
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-background)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]')
                    }
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {activeTab === 'content' && <ContentTab />}
        {activeTab === 'news' && <NewsTab />}
        {activeTab === 'lineup' && <LineupTab />}
        {activeTab === 'historique' && <HistoriqueTab />}
        {activeTab === 'merch' && <MerchTab />}
        {activeTab === 'gallery' && <GalleryTab />}
        {activeTab === 'partners' && <PartnersTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'theme' && <ThemeTab />}
        {activeTab === 'media' && <MediaLibraryTab />}
        {activeTab === 'advanced' && <AdvancedTab />}
      </main>
    </div>
  )
}
