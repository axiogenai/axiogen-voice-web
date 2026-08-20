import { useState, useEffect } from 'react'
import { Player } from './components/Player'
import { VoiceGrid } from './components/VoiceGrid'
import { ApiKeysTab } from './components/ApiKeysTab'
import { DocsTab } from './components/DocsTab'
import { Sliders, Activity, Key, BookOpen, Mic, ShieldCheck, Menu, X } from 'lucide-react'

type Tab = 'studio' | 'keys' | 'docs'

export default function App() {
  const [tab, setTab] = useState<Tab>('studio')
  const [voice, setVoice] = useState('af_bella')
  const [speed, setSpeed] = useState(1.0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('axiogen_api_key') || 'teamaxiogen_admin_master'
  })

  useEffect(() => {
    localStorage.setItem('axiogen_api_key', apiKey)
  }, [apiKey])

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: 'studio', label: 'Playground', icon: Mic },
    { id: 'keys',   label: 'API Keys',   icon: Key },
    { id: 'docs',   label: 'Documentation', icon: BookOpen },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white">

      {/* Clean Enterprise Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800/80 bg-[#09090b]/90 px-3 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-white">Axiogen Voice</span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">v2.0</span>
          </div>
        </div>

        {/* Desktop Tab Selector */}
        <nav className="hidden md:flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
          {navItems.map(n => {
            const Icon = n.icon
            const active = tab === n.id
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setTab(n.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer
                  ${active
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
              >
                <Icon className="h-3.5 w-3.5 opacity-70" />
                <span>{n.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Status indicator (desktop) + Mobile menu button */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="h-3 w-3" />
            <span>Strict Auth</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono text-zinc-400">Ampere A1 Active</span>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-md px-4 py-3 space-y-1 z-30">
          {navItems.map(n => {
            const Icon = n.icon
            const active = tab === n.id
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => { setTab(n.id); setMobileMenuOpen(false) }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer
                  ${active
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
              >
                <Icon className="h-4 w-4 opacity-70" />
                <span>{n.label}</span>
              </button>
            )
          })}
          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400">Ampere A1 · 4 OCPU · 24GB</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-8">

        {/* Playground Tab */}
        {tab === 'studio' && (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_340px]">

            {/* Main Area */}
            <div className="space-y-4 sm:space-y-5">
              {/* Input Card */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Input Text
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Max 5,000 characters</span>
                </div>
                <Player voice={voice} speed={speed} apiKey={apiKey} />
              </div>

              {/* Voice Selection */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Voice Model
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">24kHz Neural</span>
                </div>
                <VoiceGrid selected={voice} onSelect={setVoice} />
              </div>
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-4 sm:space-y-5">
              {/* Speed Slider Card */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pacing Speed</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-200">{speed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={speed}
                  onChange={e => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-zinc-100 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>0.50x</span>
                  <span>1.00x</span>
                  <span>2.00x</span>
                </div>
              </div>

              {/* Master Authentication Token */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                    Active API Key
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Required</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Enter axg_ key or master token"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Synthesis requests are strictly authenticated against this token.
                </p>
              </div>

              {/* Performance Metrics */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 sm:p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
                  Engine Specifications
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-center">
                    <div className="font-mono text-base font-bold text-zinc-100">54</div>
                    <div className="text-[10px] font-medium text-zinc-500 mt-0.5">Voices</div>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-center">
                    <div className="font-mono text-base font-bold text-zinc-100">24kHz</div>
                    <div className="text-[10px] font-medium text-zinc-500 mt-0.5">Sample Rate</div>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 text-center">
                    <div className="font-mono text-base font-bold text-zinc-100">FP16</div>
                    <div className="text-[10px] font-medium text-zinc-500 mt-0.5">Precision</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {tab === 'keys' && <ApiKeysTab />}

        {/* Documentation Tab */}
        {tab === 'docs' && <DocsTab />}
      </main>
    </div>
  )
}
