import { VOICES, type Voice } from '../lib/tts'

interface VoiceGridProps {
  selected: string
  onSelect: (id: string) => void
}

export function VoiceGrid({ selected, onSelect }: VoiceGridProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
        {VOICES.slice(0, 8).map((v: Voice) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className={`rounded-xl border p-3 text-left transition-all duration-150 cursor-pointer
              ${selected === v.id
                ? 'border-violet-500 bg-violet-500/15 shadow-[0_0_14px_rgba(139,92,246,0.3)]'
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-800'
              }`}
          >
            <div className="text-sm font-bold text-white">{v.emoji} {v.name}</div>
            <div className="text-[10px] font-semibold uppercase text-zinc-500 mt-0.5">
              {v.gender} · {v.accent}
            </div>
          </button>
        ))}
      </div>

      {/* Full dropdown for all voices */}
      <select
        value={selected}
        onChange={e => onSelect(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500"
      >
        {VOICES.map(v => (
          <option key={v.id} value={v.id}>
            {v.emoji} {v.name} — {v.accent} {v.gender} ({v.style})
          </option>
        ))}
      </select>
    </div>
  )
}
