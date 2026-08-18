import { VOICES, type Voice } from '../lib/tts'

interface VoiceGridProps {
  selected: string
  onSelect: (id: string) => void
}

export function VoiceGrid({ selected, onSelect }: VoiceGridProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {VOICES.slice(0, 8).map((v: Voice) => {
          const isSelected = selected === v.id
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              className={`group relative flex flex-col justify-between rounded-lg border p-3 text-left transition-all duration-150 cursor-pointer
                ${isSelected
                  ? 'border-violet-500/80 bg-violet-950/20 text-white shadow-sm ring-1 ring-violet-500/40'
                  : 'border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300'
                }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-sm font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                  {v.name}
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    isSelected ? 'bg-violet-400' : 'bg-transparent group-hover:bg-zinc-600'
                  }`}
                />
              </div>
              <div className="text-[11px] font-medium text-zinc-500">
                {v.gender} · {v.accent}
              </div>
            </button>
          )
        })}
      </div>

      {/* Full Voice Selector Dropdown */}
      <div className="relative">
        <select
          value={selected}
          onChange={e => onSelect(e.target.value)}
          className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/70 px-3.5 py-2.5 text-xs font-medium text-zinc-200 outline-none hover:border-zinc-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors cursor-pointer"
        >
          {VOICES.map(v => (
            <option key={v.id} value={v.id} className="bg-zinc-900 text-zinc-200">
              {v.name} — {v.accent} {v.gender} ({v.style})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
