import { useState } from 'react'
import { Player } from './components/Player'
import { VoiceGrid } from './components/VoiceGrid'
import { ApiKeysTab } from './components/ApiKeysTab'
import { DocsTab } from './components/DocsTab'

type Tab = 'studio' | 'keys' | 'docs'

export default function App() {
  const [tab, setTab] = useState<Tab>('studio')
  const [voice, setVoice] = useState('af_bella')
  const [speed, setSpeed] = useState(1.0)

  const navItems: { id: Tab; label: string }[] = [
    { id: 'studio', label: 'Playground' },
    { id: 'keys',   label: 'API Keys' },
    { id: 'docs',   label: 'API Docs' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* Header */}
      <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-base">
            ⚡
          </div>
          <span className="text-lg font-extrabold tracking-tight">Axiogen Voice Pro</span>
        </div>

        <nav className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {navItems.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-all duration-150
                ${tab === n.id
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          RTX 6000 Live
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-[1240px] px-5 py-7">

        {/* Studio tab */}
        {tab === 'studio' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">

            {/* Left column */}
            <div className="space-y-4">
              {/* Text input + stream button */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                  📝 Text to Synthesize
                </p>
                <Player voice={voice} speed={speed} />
              </div>

              {/* Voice selection */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                  🎭 Voice
                </p>
                <VoiceGrid selected={voice} onSelect={setVoice} />
              </div>

              {/* Speed control */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">🎚️ Speed</p>
                  <span className="font-mono text-sm font-bold text-violet-400">{speed.toFixed(2)}×</span>
                </div>
                <input
                  type="range"
                  min={0.5} max={2.0} step={0.05}
                  value={speed}
                  onChange={e => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-violet-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>0.5×</span><span>1.0×</span><span>2.0×</span>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              {/* Stats */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">📊 Platform</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: '54', label: 'Voices' },
                    { value: '24kHz', label: 'Quality' },
                    { value: '<200ms', label: 'First Chunk' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-center">
                      <div className="font-mono text-lg font-extrabold text-violet-400">{s.value}</div>
                      <div className="text-[10px] font-semibold uppercase text-zinc-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick API */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">💻 Quick API</p>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-blue-300 overflow-x-auto whitespace-pre">
{`from gradio_client import Client
import base64

c = Client("adityax26/axiogenttspro")
b64 = c.predict(
  text="Hello!",
  voice="af_bella",
  speed=1.0,
  api_name="/generate_gpu_b64"
)`}
                </div>
              </div>

              {/* API Key */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">🔑 API Key</p>
                <input
                  readOnly
                  value="teamaxiogen_admin_master"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-400"
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'keys' && <ApiKeysTab />}
        {tab === 'docs' && <DocsTab />}
      </main>
    </div>
  )
}
