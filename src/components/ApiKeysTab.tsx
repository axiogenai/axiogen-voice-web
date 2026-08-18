import { useState } from 'react'
import { X, Plus, Key } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
}

export function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: 'master',
      name: 'Master Admin Key',
      key: 'teamaxiogen_admin_master',
      created: 'System Default',
    },
  ])
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')

  const createKey = () => {
    const key =
      'axg_' +
      Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    setKeys(prev => [
      ...prev,
      { id: Date.now().toString(), name: newName || 'Default Key', key, created: 'Just now' },
    ])
    setNewName('')
    setShowModal(false)
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
              <h2 className="text-sm font-semibold text-white">API Authentication Keys</h2>
              <p className="text-xs text-zinc-400">Tokens for server-to-server and client integration.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Create Key
          </button>
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
              {keys.map(k => (
                <tr key={k.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-zinc-200">{k.name}</td>
                  <td className="py-3 px-4">
                    <code className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-[11px] text-zinc-300 border border-zinc-800">
                      {k.id === 'master' ? 'teamaxiogen_••••••••master' : mask(k.key)}
                    </code>
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
                        onClick={() => setKeys(prev => prev.filter(x => x.id !== k.id))}
                        className="text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Create New API Key</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">Specify an identifier name for the client application.</p>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createKey()}
              placeholder="e.g. Production-Service, Discord-Bot"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createKey}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white cursor-pointer"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
