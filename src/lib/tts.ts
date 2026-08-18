// Axiogen Voice Pro — TTS API client
// Production 54-Voice Neural Speech Engine

export const API_BASE = 'https://voice.axiogen.in/api'
export const HF_BASE = API_BASE

export interface Voice {
  id: string
  name: string
  accent: string
  gender: string
  style: string
}

export const VOICES: Voice[] = [
  // --- American English (Female) ---
  { id: 'af_bella',    name: 'Bella',    accent: 'American', gender: 'Female', style: 'Warm & Natural' },
  { id: 'af_sarah',    name: 'Sarah',    accent: 'American', gender: 'Female', style: 'Clear & Professional' },
  { id: 'af_nicole',   name: 'Nicole',   accent: 'American', gender: 'Female', style: 'Conversational & Fast' },
  { id: 'af_sky',      name: 'Sky',      accent: 'American', gender: 'Female', style: 'Energetic & Youthful' },
  { id: 'af_heart',    name: 'Heart',    accent: 'American', gender: 'Female', style: 'Soft & Expressive' },
  { id: 'af_alloy',    name: 'Alloy',    accent: 'American', gender: 'Female', style: 'Modern & Direct' },
  { id: 'af_aoede',    name: 'Aoede',    accent: 'American', gender: 'Female', style: 'Deep & Resonant' },
  { id: 'af_jessica',  name: 'Jessica',  accent: 'American', gender: 'Female', style: 'Bright & Friendly' },
  { id: 'af_kore',     name: 'Kore',     accent: 'American', gender: 'Female', style: 'Calm & Relaxed' },
  { id: 'af_river',    name: 'River',    accent: 'American', gender: 'Female', style: 'Smooth & Intimate' },
  { id: 'af_nova',     name: 'Nova',     accent: 'American', gender: 'Female', style: 'Vibrant & Modern' },

  // --- American English (Male) ---
  { id: 'am_adam',     name: 'Adam',     accent: 'American', gender: 'Male',   style: 'Deep & Authoritative' },
  { id: 'am_michael',  name: 'Michael',  accent: 'American', gender: 'Male',   style: 'Warm & Trustworthy' },
  { id: 'am_echo',     name: 'Echo',     accent: 'American', gender: 'Male',   style: 'Dynamic & Engaging' },
  { id: 'am_eric',     name: 'Eric',     accent: 'American', gender: 'Male',   style: 'Crisp & Professional' },
  { id: 'am_fenrir',   name: 'Fenrir',   accent: 'American', gender: 'Male',   style: 'Commanding & Strong' },
  { id: 'am_liam',     name: 'Liam',     accent: 'American', gender: 'Male',   style: 'Narrative & Smooth' },
  { id: 'am_onyx',     name: 'Onyx',     accent: 'American', gender: 'Male',   style: 'Grounded & Rich' },
  { id: 'am_puck',     name: 'Puck',     accent: 'American', gender: 'Male',   style: 'Playful & Expressive' },
  { id: 'am_santa',    name: 'Santa',    accent: 'American', gender: 'Male',   style: 'Warm & Jovial' },

  // --- British English (Female) ---
  { id: 'bf_emma',     name: 'Emma',     accent: 'British',  gender: 'Female', style: 'Refined & Articulate' },
  { id: 'bf_isabella', name: 'Isabella', accent: 'British',  gender: 'Female', style: 'Graceful & Formal' },
  { id: 'bf_alice',    name: 'Alice',    accent: 'British',  gender: 'Female', style: 'Classic British' },
  { id: 'bf_lily',     name: 'Lily',     accent: 'British',  gender: 'Female', style: 'Gentle & Delicate' },

  // --- British English (Male) ---
  { id: 'bm_george',   name: 'George',   accent: 'British',  gender: 'Male',   style: 'Distinguished & Classic' },
  { id: 'bm_daniel',   name: 'Daniel',   accent: 'British',  gender: 'Male',   style: 'Modern British' },
  { id: 'bm_fable',    name: 'Fable',    accent: 'British',  gender: 'Male',   style: 'Storyteller & Deep' },
  { id: 'bm_lewis',    name: 'Lewis',    accent: 'British',  gender: 'Male',   style: 'Articulate & Clear' },

  // --- Spanish ---
  { id: 'ef_dora',     name: 'Dora',     accent: 'Spanish',  gender: 'Female', style: 'Natural Spanish' },
  { id: 'em_alex',     name: 'Alex',     accent: 'Spanish',  gender: 'Male',   style: 'Clear Spanish' },
  { id: 'em_santa',    name: 'Santa ES', accent: 'Spanish',  gender: 'Male',   style: 'Deep Spanish' },

  // --- French ---
  { id: 'ff_siwis',    name: 'Siwis',    accent: 'French',   gender: 'Female', style: 'Native French' },

  // --- Hindi ---
  { id: 'hf_alpha',    name: 'Alpha HI', accent: 'Hindi',    gender: 'Female', style: 'Expressive Hindi' },
  { id: 'hf_beta',     name: 'Beta HI',  accent: 'Hindi',    gender: 'Female', style: 'Clear Hindi' },
  { id: 'hm_omega',    name: 'Omega HI', accent: 'Hindi',    gender: 'Male',   style: 'Resonant Hindi' },
  { id: 'hm_psi',      name: 'Psi HI',   accent: 'Hindi',    gender: 'Male',   style: 'Narrative Hindi' },

  // --- Italian ---
  { id: 'if_sara',     name: 'Sara',     accent: 'Italian',  gender: 'Female', style: 'Melodic Italian' },
  { id: 'im_nicola',   name: 'Nicola',   accent: 'Italian',  gender: 'Male',   style: 'Articulate Italian' },

  // --- Japanese ---
  { id: 'jf_alpha',      name: 'Alpha JP',      accent: 'Japanese', gender: 'Female', style: 'Polite Japanese' },
  { id: 'jf_gongitsune', name: 'Gongitsune',   accent: 'Japanese', gender: 'Female', style: 'Story Japanese' },
  { id: 'jf_nezumi',     name: 'Nezumi',       accent: 'Japanese', gender: 'Female', style: 'Lively Japanese' },
  { id: 'jf_tebukuro',   name: 'Tebukuro',     accent: 'Japanese', gender: 'Female', style: 'Soft Japanese' },
  { id: 'jm_kumo',       name: 'Kumo',         accent: 'Japanese', gender: 'Male',   style: 'Deep Japanese' },

  // --- Mandarin Chinese ---
  { id: 'zf_xiaobei',  name: 'Xiaobei',  accent: 'Chinese',  gender: 'Female', style: 'Friendly Mandarin' },
  { id: 'zf_xiaoni',   name: 'Xiaoni',   accent: 'Chinese',  gender: 'Female', style: 'Conversational' },
  { id: 'zf_xiaoxiao', name: 'Xiaoxiao', accent: 'Chinese',  gender: 'Female', style: 'Gentle Mandarin' },
  { id: 'zf_xiaoyi',   name: 'Xiaoyi',   accent: 'Chinese',  gender: 'Female', style: 'Clear Mandarin' },
  { id: 'zm_yunjian',  name: 'Yunjian',  accent: 'Chinese',  gender: 'Male',   style: 'Broadcast Style' },
  { id: 'zm_yunxi',    name: 'Yunxi',    accent: 'Chinese',  gender: 'Male',   style: 'Narrative Mandarin' },
  { id: 'zm_yunxia',   name: 'Yunxia',   accent: 'Chinese',  gender: 'Male',   style: 'Formal Mandarin' },
  { id: 'zm_yunyang',  name: 'Yunyang',  accent: 'Chinese',  gender: 'Male',   style: 'Dynamic Mandarin' },

  // --- Brazilian Portuguese ---
  { id: 'pf_dora',     name: 'Dora PT',  accent: 'Portuguese', gender: 'Female', style: 'Warm Portuguese' },
  { id: 'pm_alex',     name: 'Alex PT',  accent: 'Portuguese', gender: 'Male',   style: 'Clear Portuguese' },
  { id: 'pm_santa',    name: 'Santa PT', accent: 'Portuguese', gender: 'Male',   style: 'Deep Portuguese' },
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

// Generate audio for a single sentence / full text → returns base64 WAV
export async function generateChunk(
  sentence: string,
  voice: string,
  speed: number,
  apiKey: string = 'teamaxiogen_admin_master'
): Promise<string> {
  const r1 = await fetch(`${HF_BASE}/gradio_api/call/generate_gpu_b64`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [sentence, voice, speed, apiKey] }),
  })
  if (!r1.ok) throw new Error(`Engine error (${r1.status})`)
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
  throw new Error('No audio data received')
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
    if (buf.byteLength < 44) continue
    const view = new DataView(buf)
    sr = view.getUint32(24, true)
    ch = view.getUint16(22, true)
    bits = view.getUint16(34, true)
    const data = new Uint8Array(buf, 44)
    pcm.push(data)
    pcmTotal += data.byteLength
  }

  const out = new ArrayBuffer(44 + pcmTotal)
  const v = new DataView(out)
  const w = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i))
  }
  w(0, 'RIFF'); v.setUint32(4, 36 + pcmTotal, true); w(8, 'WAVE')
  w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true)
  v.setUint16(22, ch, true); v.setUint32(24, sr, true)
  v.setUint32(28, (sr * ch * bits) / 8, true); v.setUint16(32, (ch * bits) / 8, true)
  v.setUint16(34, bits, true); w(36, 'data'); v.setUint32(40, pcmTotal, true)

  const u8 = new Uint8Array(out)
  let offset = 44
  for (const p of pcm) {
    u8.set(p, offset)
    offset += p.byteLength
  }
  return new Blob([out], { type: 'audio/wav' })
}
