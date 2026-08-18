import { useState } from 'react'
import { X, Plus } from 'lucide-react'

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
      created: 'Default',
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
      { id: Date.now().toString(), name: newName || 'Untitled', key, created: 'Just now' },
    ])
    setNewName('')
    setShowModal(false)
  }

  const mask = (k: string) => k.slice(0, 8) + '••••••••' + k.slice(-4)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">🔑 API Keys</h2>
            <p className="text-sm text-zinc-500 mt-1">Manage keys for your apps, bots, and agents.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-500 transition-colors"
          >
            <Plus size={14} /> New Key
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Name', 'Token', 'Created', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k.id} className="border-b border-zinc-800/50">
                <td className="py-3 px-3 font-semibold">{k.name}</td>
                <td className="py-3 px-3">
                  <code className="rounded bg-zinc-950 px-2 py-0.5 text-xs text-zinc-300">
                    {k.id === 'master' ? 'teamaxiogen_••••••••master' : mask(k.key)}
                  </code>
                </td>
                <td className="py-3 px-3 text-zinc-500">{k.created}</td>
                <td className="py-3 px-3">
                  <span className="font-bold text-emerald-400">● Active</span>
                </td>
                <td className="py-3 px-3">
                  {k.id === 'master' ? (
                    <span className="text-zinc-600 text-xs">Protected</span>
                  ) : (
                    <button
                      onClick={() => setKeys(prev => prev.filter(x => x.id !== k.id))}
                      className="text-xs font-semibold text-red-400 hover:text-red-300"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">Create API Key</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-zinc-500 mb-4">Name this key to identify the app using it.</p>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createKey()}
              placeholder="e.g. Discord-Bot, Mobile-App"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-violet-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={createKey}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
