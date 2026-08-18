import { useState, useCallback, useRef } from 'react'
import { HF_BASE, b64toArrayBuffer, mergeWAVs } from '../lib/tts'
import { Wave } from './Wave'
import { Volume2, CheckCircle2, Zap, ShieldAlert } from 'lucide-react'

interface PlayerProps {
  voice: string
  speed: number
  apiKey: string
}

type Status = 'idle' | 'streaming' | 'done' | 'error'

export function Player({ voice, speed, apiKey }: PlayerProps) {
  const [text, setText] = useState(
    'Hello! Welcome to Axiogen Voice Pro.\n\nOur streaming engine yields audio chunks clause by clause over an open SSE connection. Chunk 1 begins playing immediately while subsequent speech is synthesized in the background without delay.'
  )
  const [status, setStatus] = useState<Status>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [firstSoundMs, setFirstSoundMs] = useState<number | null>(null)
  const [totalMs, setTotalMs] = useState<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const streamSpeech = useCallback(async () => {
    if (status === 'streaming') return
    const trimmed = text.trim()
    if (!trimmed) return

    // STRICT API KEY ENFORCEMENT
    if (!apiKey || !apiKey.trim()) {
      setStatus('error')
      setStatusMsg('Unauthorized: API key required. Please enter an active key in the sidebar.')
      return
    }

    setStatus('streaming')
    setStatusMsg('Authenticating and connecting stream...')
    setAudioUrl(null)
    setFirstSoundMs(null)
    setTotalMs(null)

    // Terminate any previous audio context to prevent overlapping playback
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        await audioContextRef.current.close()
      } catch (e) {
        // ignore
      }
    }

    const AudioCtx = window.AudioContext ?? (window as any).webkitAudioContext
    const ctx = new AudioCtx({ sampleRate: 24000 })
    audioContextRef.current = ctx
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    let nextStartTime = ctx.currentTime + 0.05
    let firstPlayed = false
    const t0 = performance.now()
    const allBuffers: ArrayBuffer[] = []
    const processedIndices = new Set<number>()

    try {
      // 1. INITIATE STREAM VIA GRADIO SSE ENDPOINT WITH STRICT AUTH KEY
      const initRes = await fetch(`${HF_BASE}/gradio_api/call/stream_tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [trimmed, voice, speed, apiKey.trim()] })
      })

      if (!initRes.ok) throw new Error(`Authentication/Server error (${initRes.status})`)
      const { event_id } = await initRes.json()

      // 2. READ SSE CHUNK STREAM USING GETREADER()
      const streamRes = await fetch(`${HF_BASE}/gradio_api/call/stream_tts/${event_id}`)
      if (!streamRes.body) throw new Error('Readable stream not supported')

      const reader = streamRes.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let sseBuffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })
        const lines = sseBuffer.split('\n')
        sseBuffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const raw = JSON.parse(line.slice(5).trim())
              const jsonStr = Array.isArray(raw) ? raw[0] : raw
              const payload = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr

              // Check if backend returned authentication error
              if (payload && payload.error) {
                throw new Error(payload.error)
              }

              // CRITICAL: DEDUPLICATE CHUNKS BY INDEX (Gradio SSE sends generating + complete duplicate)
              if (payload && payload.audio && typeof payload.index === 'number') {
                if (processedIndices.has(payload.index)) {
                  continue
                }
                processedIndices.add(payload.index)

                setStatusMsg(`Streaming chunk ${payload.index + 1}: "${payload.text.slice(0, 30)}..."`)

                const ab = b64toArrayBuffer(payload.audio)
                allBuffers.push(ab)

                // Decode single chunk to Web Audio buffer
                const audioBuffer = await ctx.decodeAudioData(ab.slice(0))

                if (!firstPlayed) {
                  const ms = Math.round(performance.now() - t0)
                  setFirstSoundMs(ms)
                  firstPlayed = true
                }

                // Play chunk immediately on the Web Audio timeline
                const source = ctx.createBufferSource()
                source.buffer = audioBuffer
                source.connect(ctx.destination)

                const now = ctx.currentTime
                if (nextStartTime < now) nextStartTime = now + 0.02
                source.start(nextStartTime)
                nextStartTime += audioBuffer.duration
              }
            } catch (e: any) {
              if (e.message && e.message.includes('Unauthorized')) {
                throw e
              }
            }
          }
        }
      }

      const elapsed = Math.round(performance.now() - t0)
      setTotalMs(elapsed)
      setStatus('done')
      setStatusMsg(`Stream complete (${processedIndices.size} chunks rendered)`)

      // Create merged full audio for seekable replay
      const mergedBlob = mergeWAVs(allBuffers)
      if (mergedBlob) {
        setAudioUrl(URL.createObjectURL(mergedBlob))
      }

    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err.message ?? 'Streaming error')
    }
  }, [text, voice, speed, apiKey, status])

  const isStreaming = status === 'streaming'

  return (
    <div className="space-y-4">
      {/* Input container */}
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={5000}
          rows={5}
          placeholder="Enter text to stream speech in real-time..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 leading-relaxed resize-y outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all font-normal"
        />
        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Zap className="w-3 h-3 text-violet-400" />
            <span>Strict Auth · Instant first-chunk streaming</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {text.length} / 5000
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={streamSpeech}
        disabled={isStreaming}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-white active:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm cursor-pointer"
      >
        {isStreaming ? (
          <>
            <Wave />
            <span>Streaming Speech Live...</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-zinc-800" />
            <span>Stream Speech (Authenticated)</span>
          </>
        )}
      </button>

      {/* Audio Playback & Diagnostics Panel */}
      {status !== 'idle' && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium">
              {isStreaming && <Wave />}
              {status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {status === 'error' && <ShieldAlert className="w-3.5 h-3.5 text-red-400" />}
              <span className={status === 'error' ? 'text-red-400 font-semibold' : 'text-zinc-300'}>
                {statusMsg}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {firstSoundMs !== null && (
                <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-400">
                  First sound: {firstSoundMs}ms
                </span>
              )}
              {totalMs !== null && (
                <span className="font-mono text-xs text-zinc-500">
                  Total: {(totalMs / 1000).toFixed(2)}s
                </span>
              )}
            </div>
          </div>

          {audioUrl && (
            <div className="pt-1 border-t border-zinc-800/60 mt-2">
              <span className="text-[10px] uppercase font-semibold text-zinc-500 block mb-1.5">Replay & Seek Full Audio</span>
              <audio
                controls
                src={audioUrl}
                className="w-full h-9 rounded"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
