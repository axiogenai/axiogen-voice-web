import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Key, Copy, Check, Eye, EyeOff, CheckCircle2, RefreshCw, Database } from 'lucide-react'
import { API_BASE } from '../lib/tts'

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

  // Fetch keys directly from server SQLite database
  const fetchDbKeys = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/v1/keys/list`, {
        headers: { 'Authorization': 'Bearer teamaxiogen_admin_master' }
      })
      if (!res.ok) throw new Error('Failed to connect to database')
      const dbKeys: ApiKey[] = await res.json()

      if (Array.isArray(dbKeys)) {
        setKeys(dbKeys)
        localStorage.setItem('axiogen_user_keys', JSON.stringify(dbKeys))
      }
    } catch (err) {
      console.warn('Database sync note:', err)
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

  // Create key permanently in server SQLite database
  const handleCreate = async () => {
    const keyName = newName.trim() || 'API Key'
    setShowCreateModal(false)
    setIsLoading(true)
    setNewName('')

    try {
      const res = await fetch(`${API_BASE}/v1/keys/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer teamaxiogen_admin_master'
        },
        body: JSON.stringify({ name: keyName }),
      })
      if (res.ok) {
        const serverKey = await res.json()
        if (serverKey && serverKey.key) {
          setCreatedKeyData(serverKey)
          // Refresh list from database
          await fetchDbKeys()
        }
      }
    } catch (err) {
      console.warn('Create key error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Revoke key in server SQLite database
  const handleRevoke = async (keyId: string) => {
    if (keyId === 'master') return
    setIsLoading(true)
    try {
      await fetch(`${API_BASE}/v1/keys/revoke?key_id=${encodeURIComponent(keyId)}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer teamaxiogen_admin_master' }
      })
      await fetchDbKeys()
    } catch (err) {
      console.warn('Revoke sync error:', err)
    } finally {
      setIsLoading(false)
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
              <Plus className="h-3.5 w-3.5" />
              Create New Key
            </button>
          </div>
        </div>

        {/* Keys Table */}
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/40">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-medium text-zinc-400">
              <tr>
                <th className="py-2.5 px-4">Name / Label</th>
                <th className="py-2.5 px-4 font-mono">Key Token</th>
                <th className="py-2.5 px-4">Created</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
              {keys.map(k => {
                const isRevealed = revealedIds.has(k.id)
                const isMaster = k.id === 'master'
                return (
                  <tr key={k.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4 font-sans font-medium text-zinc-200">
                      <div className="flex items-center gap-1.5">
                        {k.name}
                        {isMaster && (
                          <span className="rounded bg-violet-500/10 border border-violet-500/30 px-1.5 py-0.2 text-[10px] font-medium text-violet-400 font-mono">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-zinc-400">
                          {isRevealed ? k.key : mask(k.key)}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(k.id)}
                          className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-[11px] font-sans">
                      {k.created}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(k.key, k.id)}
                          className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedId === k.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        {!isMaster && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(k.id)}
                            className="text-[11px] font-medium text-red-400/80 hover:text-red-400 transition-colors ml-2 cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Key */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
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
            <p className="text-xs text-zinc-400">
              Give your key a label to identify where and how it is used.
            </p>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Key Label / Application Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Production Backend, iOS App, Cursor IDE"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreate()
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="rounded-lg bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white cursor-pointer"
              >
                Generate Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Key Created Success */}
      {createdKeyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="text-sm font-semibold text-white">API Key Created Successfully</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your API key is active and ready to authenticate requests. Copy and store it safely.
            </p>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 flex items-center justify-between">
              <code className="text-xs font-mono text-emerald-400 break-all select-all">
                {createdKeyData.key}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(createdKeyData.key, createdKeyData.id)}
                className="ml-2 flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700 cursor-pointer shrink-0"
              >
                {copiedId === createdKeyData.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedId === createdKeyData.id ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCreatedKeyData(null)}
                className="rounded-lg bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white cursor-pointer"
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
