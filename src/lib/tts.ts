// Axiogen Voice Pro — TTS API client
// Calls the HF Space Gradio API, splits text, streams audio chunks

export const HF_BASE =
  import.meta.env.VITE_HF_BASE ?? 'https://adityax26-axiogenttspro.hf.space'

export interface Voice {
  id: string
  name: string
  emoji: string
  accent: string
  gender: string
  style: string
}

export const VOICES: Voice[] = [
  { id: 'af_bella',   name: 'Bella',   emoji: '✨', accent: 'American', gender: 'Female', style: 'Warm & Natural' },
  { id: 'af_heart',   name: 'Heart',   emoji: '❤️', accent: 'American', gender: 'Female', style: 'Soft & Expressive' },
  { id: 'af_sarah',   name: 'Sarah',   emoji: '💼', accent: 'American', gender: 'Female', style: 'Professional' },
  { id: 'af_nicole',  name: 'Nicole',  emoji: '🌟', accent: 'American', gender: 'Female', style: 'Friendly' },
  { id: 'af_sky',     name: 'Sky',     emoji: '☁️', accent: 'American', gender: 'Female', style: 'Energetic' },
  { id: 'am_adam',    name: 'Adam',    emoji: '🎙️', accent: 'American', gender: 'Male',   style: 'Deep & Authoritative' },
  { id: 'am_michael', name: 'Michael', emoji: '🎧', accent: 'American', gender: 'Male',   style: 'Warm & Trustworthy' },
  { id: 'bf_emma',    name: 'Emma',    emoji: '👑', accent: 'British',  gender: 'Female', style: 'Elegant & Refined' },
  { id: 'bf_alice',   name: 'Alice',   emoji: '🫖', accent: 'British',  gender: 'Female', style: 'Classic British' },
  { id: 'bf_lily',    name: 'Lily',    emoji: '🌸', accent: 'British',  gender: 'Female', style: 'Sweet & Gentle' },
  { id: 'bm_george',  name: 'George',  emoji: '🎩', accent: 'British',  gender: 'Male',   style: 'Distinguished' },
  { id: 'bm_daniel',  name: 'Daniel',  emoji: '📻', accent: 'British',  gender: 'Male',   style: 'Modern British' },
]

// Split text into sentence-sized chunks for streaming
export function splitSentences(text: string): string[] {
  const segs = text.match(/[^.!?;\n]+[.!?;\n]*/g) ?? [text]
  const out: string[] = []
  for (const seg of segs) {
    const t = seg.trim()
    if (!t) continue
    const words = t.split(/\s+/)
    if (words.length <= 20) { out.push(t); continue }
    let curr = ''
    for (const clause of t.split(',')) {
      const c = clause.trim()
      if (!c) continue
      if ((curr + ' ' + c).split(/\s+/).length > 18 && curr) {
        out.push(curr.trim()); curr = c
      } else {
        curr = (curr + ' ' + c).trim()
      }
    }
    if (curr.trim()) out.push(curr.trim())
  }
  return out.length ? out : [text.trim()]
}

// Generate audio for a single sentence → returns base64 WAV
export async function generateChunk(
  sentence: string,
  voice: string,
  speed: number
): Promise<string> {
  const r1 = await fetch(`${HF_BASE}/gradio_api/call/generate_gpu_b64`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [sentence, voice, speed] }),
  })
  if (!r1.ok) throw new Error(`API error ${r1.status}`)
  const { event_id } = await r1.json()

  const r2 = await fetch(`${HF_BASE}/gradio_api/call/generate_gpu_b64/${event_id}`)
  const text = await r2.text()
  for (const line of text.split('\n')) {
    if (line.startsWith('data:')) {
      try {
        const parsed = JSON.parse(line.slice(5).trim())
        const v = Array.isArray(parsed) ? parsed[0] : parsed
        if (v && typeof v === 'string' && v.length > 10) return v
      } catch { /* skip */ }
    }
  }
  throw new Error('No audio data in response')
}

// base64 → ArrayBuffer
export function b64toArrayBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64)
  const buf = new ArrayBuffer(bin.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i)
  return buf
}

// Merge multiple WAV ArrayBuffers into one Blob
export function mergeWAVs(bufs: ArrayBuffer[]): Blob | null {
  if (!bufs.length) return null
  if (bufs.length === 1) return new Blob([bufs[0]], { type: 'audio/wav' })

  let pcmTotal = 0
  const pcm: Uint8Array[] = []
  let sr = 24000, ch = 1, bits = 16

  for (const buf of bufs) {
    const dv = new DataView(buf)
    if (!pcm.length) {
      ch = dv.getUint16(22, true)
      sr = dv.getUint32(24, true)
      bits = dv.getUint16(34, true)
    }
    let off = 12
    while (off < buf.byteLength - 8) {
      const id = String.fromCharCode(dv.getUint8(off), dv.getUint8(off+1), dv.getUint8(off+2), dv.getUint8(off+3))
      const sz = dv.getUint32(off + 4, true)
      if (id === 'data') { pcm.push(new Uint8Array(buf, off + 8, sz)); pcmTotal += sz; break }
      off += 8 + sz
    }
  }

  const wav = new ArrayBuffer(44 + pcmTotal)
  const w = new DataView(wav)
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) w.setUint8(o + i, s.charCodeAt(i)) }
  ws(0, 'RIFF'); w.setUint32(4, 36 + pcmTotal, true); ws(8, 'WAVE'); ws(12, 'fmt ')
  w.setUint32(16, 16, true); w.setUint16(20, 1, true); w.setUint16(22, ch, true)
  w.setUint32(24, sr, true); w.setUint32(28, sr * ch * bits / 8, true)
  w.setUint16(32, ch * bits / 8, true); w.setUint16(34, bits, true)
  ws(36, 'data'); w.setUint32(40, pcmTotal, true)
  let pos = 44
  for (const p of pcm) { new Uint8Array(wav, pos, p.length).set(p); pos += p.length }

  return new Blob([wav], { type: 'audio/wav' })
}
