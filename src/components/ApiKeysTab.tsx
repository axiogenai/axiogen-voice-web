import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Key, Copy, Check, Eye, EyeOff, CheckCircle2, RefreshCw, Database } from 'lucide-react'
import { HF_BASE } from '../lib/tts'

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  active?: boolean
}

const DEFAULT_KEYS: ApiKey[] = [
  {
    id: 'master',
    name: 'Master Admin Key',
    key: 'teamaxiogen_admin_master',
    created: 'System Default',
    active: true,
  },
]

export function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>(() => {
    try {
      const stored = localStorage.getItem('axiogen_user_keys')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // ignore
    }
    return DEFAULT_KEYS
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createdKeyData, setCreatedKeyData] = useState<ApiKey | null>(null)
  const [newName, setNewName] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())

  // Save to localStorage whenever keys change
  useEffect(() => {
    try {
      localStorage.setItem('axiogen_user_keys', JSON.stringify(keys))
    } catch (e) {
      console.warn('Storage save error:', e)
    }
  }, [keys])

  // Fetch keys from backend and merge with local keys (NEVER wipe local keys!)
  const fetchDbKeys = useCallback(async () => {
    setIsLoading(true)
    try {
      const initRes = await fetch(`${HF_BASE}/gradio_api/call/db_list_keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [] }),
      })
      if (!initRes.ok) throw new Error('Failed to connect to database')
      const { event_id } = await initRes.json()

      const streamRes = await fetch(`${HF_BASE}/gradio_api/call/db_list_keys/${event_id}`)
      const text = await streamRes.text()

      for (const line of text.split('\n')) {
        if (line.startsWith('data:')) {
          const raw = JSON.parse(line.slice(5).trim())
          const jsonStr = Array.isArray(raw) ? raw[0] : raw
          const dbKeys: ApiKey[] = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr

          if (Array.isArray(dbKeys) && dbKeys.length > 0) {
            setKeys(prev => {
              const map = new Map<string, ApiKey>()
              // 1. Add current local keys
              prev.forEach(k => map.set(k.key, k))
              // 2. Merge server DB keys
              dbKeys.forEach(k => map.set(k.key, k))
              const merged = Array.from(map.values())
              localStorage.setItem('axiogen_user_keys', JSON.stringify(merged))
              return merged
            })
            break
          }
        }
      }
    } catch (err) {
      console.warn('Database offline/syncing with cache:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDbKeys()
  }, [fetchDbKeys])

  const copyToClipboard = (token: string, id: string) => {
    navigator.clipboard.writeText(token)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Create key permanently
  const handleCreate = async () => {
    const keyName = newName.trim() || 'API Key'
    setShowCreateModal(false)
    setIsLoading(true)

    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    const generatedToken = `axg_${randomHex}`
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

    const newEntry: ApiKey = {
      id: `key_${randomHex.slice(0, 12)}`,
      name: keyName,
      key: generatedToken,
      created: now,
      active: true,
    }

    // 1. Immediately save locally so it CANNOT be lost
    setKeys(prev => {
      const updated = [newEntry, ...prev.filter(x => x.key !== newEntry.key)]
      localStorage.setItem('axiogen_user_keys', JSON.stringify(updated))
      return updated
    })
    setCreatedKeyData(newEntry)
    setNewName('')

    // 2. Sync with database
    try {
      const initRes = await fetch(`${HF_BASE}/gradio_api/call/db_create_key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [keyName] }),
      })
      if (initRes.ok) {
        const { event_id } = await initRes.json()
        await fetch(`${HF_BASE}/gradio_api/call/db_create_key/${event_id}`)
      }
    } catch (err) {
      console.warn('Sync warning:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Revoke key
  const handleRevoke = async (keyId: string) => {
    if (keyId === 'master') return
    setKeys(prev => {
      const updated = prev.filter(x => x.id !== keyId)
      localStorage.setItem('axiogen_user_keys', JSON.stringify(updated))
      return updated
    })

    try {
      const initRes = await fetch(`${HF_BASE}/gradio_api/call/db_revoke_key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [keyId] }),
      })
      if (initRes.ok) {
        const { event_id } = await initRes.json()
        await fetch(`${HF_BASE}/gradio_api/call/db_revoke_key/${event_id}`)
      }
    } catch (err) {
      console.warn('Revoke sync error:', err)
    }
  }

  const mask = (k: string) => k.slice(0, 8) + '••••••••' + k.slice(-4)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-zinc-800 text-zinc-300">
              <Key className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">API Authentication Keys</h2>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                  <Database className="h-2.5 w-2.5" /> Database Synced
                </span>
              </div>
              <p className="text-xs text-zinc-400">Tokens are permanently stored and validated on every request.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDbKeys}
              title="Refresh Database Keys"
              disabled={isLoading}
              className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Create Key
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-800/80">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-zinc-400">Key Name</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-zinc-400">Token</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-zinc-400">Created</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-zinc-400">Status</th>
                <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">
              {keys.map(k => {
                const isRevealed = revealedIds.has(k.id)
                const isCopied = copiedId === k.id

                return (
                  <tr key={k.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-zinc-200">{k.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-800 select-all">
                          {k.id === 'master' ? (isRevealed ? k.key : 'teamaxiogen_••••••••master') : (isRevealed ? k.key : mask(k.key))}
                        </code>
                        <button
                          type="button"
                          onClick={() => toggleReveal(k.id)}
                          title={isRevealed ? 'Hide Token' : 'Reveal Token'}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(k.key, k.id)}
                          title="Copy Token to Clipboard"
                          className="flex items-center gap-1 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/60 transition-colors cursor-pointer text-[11px]"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono">{k.created}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {k.id === 'master' ? (
                        <span className="text-[11px] text-zinc-600">Protected</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevoke(k.id)}
                          className="text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Key Input */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Create New API Key</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">Key will be permanently stored and activated.</p>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Production-Service, Discord-Bot"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isLoading}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Key Created & Copy Dialog */}
      {createdKeyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="text-sm font-semibold text-white">API Key Saved & Active</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Your key is permanently registered. Copy it now for your application:
            </p>

            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3">
              <code className="font-mono text-xs text-zinc-200 select-all break-all">
                {createdKeyData.key}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(createdKeyData.key, 'modal')}
                className="flex items-center gap-1.5 ml-3 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white transition-colors cursor-pointer shrink-0"
              >
                {copiedId === 'modal' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Token</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCreatedKeyData(null)}
                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
