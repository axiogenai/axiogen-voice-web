import { useState } from 'react'
import { CodeBlock } from './CodeBlock'
import { HF_BASE, VOICES } from '../lib/tts'
import { Terminal, Code2, Globe, Sparkles, Shield, Cpu } from 'lucide-react'

const PYTHON_STREAM_CODE = `from gradio_client import Client
import json, base64

# 1. Connect to Axiogen TTS Engine
client = Client("adityax26/axiogenttspro")

# 2. Synthesize speech (sync or streaming)
audio_b64 = client.predict(
    text="Welcome to Axiogen Voice Pro. High quality 24kHz neural speech.",
    voice="af_bella",
    speed=1.0,
    api_key="YOUR_API_KEY",  # Master admin key or 'axg_...' token
    api_name="/generate_gpu_b64"
)

# 3. Save WAV audio to disk
with open("output.wav", "wb") as f:
    f.write(base64.b64decode(audio_b64))

print("Speech generated successfully -> output.wav")`

const JS_BROWSER_CODE = `// In React, Next.js, or vanilla JavaScript
async function playSpeech(text, voice = 'af_bella', apiKey = 'YOUR_API_KEY') {
  const BASE_URL = '${HF_BASE}';

  // 1. Submit synthesis job
  const initRes = await fetch(\`\${BASE_URL}/gradio_api/call/generate_gpu_b64\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [text, voice, 1.0, apiKey]
    })
  });

  const { event_id } = await initRes.json();

  // 2. Fetch the base64 audio stream
  const streamRes = await fetch(\`\${BASE_URL}/gradio_api/call/generate_gpu_b64/\${event_id}\`);
  const streamText = await streamRes.text();

  for (const line of streamText.split('\\n')) {
    if (line.startsWith('data:')) {
      const [base64Wav] = JSON.parse(line.slice(5));
      
      // 3. Play audio immediately in browser
      const audio = new Audio(\`data:audio/wav;base64,\${base64Wav}\`);
      await audio.play();
      return;
    }
  }
}

// Example usage:
playSpeech("Hello from my web application!");`

const JS_STREAMING_CODE = `// Low-latency sentence-by-sentence streaming reader
async function streamRealtimeSpeech(text, voice = 'af_bella', apiKey = 'YOUR_API_KEY') {
  const BASE_URL = '${HF_BASE}';

  const initRes = await fetch(\`\${BASE_URL}/gradio_api/call/stream_tts\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [text, voice, 1.0, apiKey] })
  });

  const { event_id } = await initRes.json();
  const streamRes = await fetch(\`\${BASE_URL}/gradio_api/call/stream_tts/\${event_id}\`);
  const reader = streamRes.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const raw = JSON.parse(line.slice(5).trim());
        const jsonStr = Array.isArray(raw) ? raw[0] : raw;
        const chunk = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;

        if (chunk && chunk.audio) {
          console.log(\`Received chunk \${chunk.index}: "\${chunk.text}" (\${chunk.duration}s)\`);
          // Play chunk immediately via Web Audio API
        }
      }
    }
  }
}`

const NODE_SAVE_CODE = `import fs from 'fs';

async function generateAudioFile(text, outputPath = 'speech.wav', apiKey = 'YOUR_API_KEY') {
  const BASE_URL = '${HF_BASE}';

  const initRes = await fetch(\`\${BASE_URL}/gradio_api/call/generate_gpu_b64\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [text, 'af_bella', 1.0, apiKey] })
  });

  const { event_id } = await initRes.json();
  const streamRes = await fetch(\`\${BASE_URL}/gradio_api/call/generate_gpu_b64/\${event_id}\`);
  const textStream = await streamRes.text();

  for (const line of textStream.split('\\n')) {
    if (line.startsWith('data:')) {
      const [base64Wav] = JSON.parse(line.slice(5));
      const buffer = Buffer.from(base64Wav, 'base64');
      fs.writeFileSync(outputPath, buffer);
      console.log(\`Saved WAV file to \${outputPath}\`);
      return;
    }
  }
}

generateAudioFile("Generating server-side speech with Node.js");`

const CURL_CODE = `# 1. Submit Synthesis Job
curl -X POST ${HF_BASE}/gradio_api/call/generate_gpu_b64 \\
  -H "Content-Type: application/json" \\
  -d '{"data": ["Hello from cURL REST API", "af_bella", 1.0, "YOUR_API_KEY"]}'

# Returns: {"event_id": "xxx"}

# 2. Fetch Result Stream
curl ${HF_BASE}/gradio_api/call/generate_gpu_b64/<event_id>`

export function DocsTab() {
  const [activeLang, setActiveLang] = useState<'js_browser' | 'js_stream' | 'node' | 'python' | 'curl'>('js_browser')

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Info */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Developer API Reference</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Production REST & SSE streaming endpoints for web apps, backends, bots, and agents.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              <Shield className="w-3 h-3" /> Auth Enforced
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
              <Cpu className="w-3 h-3" /> 24kHz Neural
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold block">Production Base URL</span>
            <code className="text-xs font-mono text-zinc-200 select-all">{HF_BASE}</code>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold block">Accepted Authentication</span>
            <code className="text-xs font-mono text-emerald-400">Bearer Token / api_key parameter (axg_...)</code>
          </div>
        </div>
      </div>

      {/* Code Examples Section */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-violet-400" />
            <span>Integration Code Examples</span>
          </h3>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
            {[
              { id: 'js_browser', label: 'React / Web', icon: Globe },
              { id: 'js_stream', label: 'Streaming SSE', icon: Sparkles },
              { id: 'node', label: 'Node.js', icon: Code2 },
              { id: 'python', label: 'Python', icon: Terminal },
              { id: 'curl', label: 'cURL', icon: Terminal },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveLang(tab.id as any)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer
                  ${activeLang === tab.id
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                <tab.icon className="w-3 h-3 opacity-70" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Code Display */}
        <div>
          {activeLang === 'js_browser' && (
            <CodeBlock code={JS_BROWSER_CODE} language="javascript" />
          )}
          {activeLang === 'js_stream' && (
            <CodeBlock code={JS_STREAMING_CODE} language="javascript" />
          )}
          {activeLang === 'node' && (
            <CodeBlock code={NODE_SAVE_CODE} language="javascript" />
          )}
          {activeLang === 'python' && (
            <CodeBlock code={PYTHON_STREAM_CODE} language="python" />
          )}
          {activeLang === 'curl' && (
            <CodeBlock code={CURL_CODE} language="bash" />
          )}
        </div>
      </div>

      {/* Endpoints Reference */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">REST & Streaming Endpoints</h3>

        <div className="space-y-3">
          {/* Endpoint 1 */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">POST</span>
              <code className="text-xs font-mono text-zinc-100 font-semibold">/gradio_api/call/stream_tts</code>
              <span className="text-[10px] text-zinc-500 font-mono ml-auto">Real-time SSE Streaming</span>
            </div>
            <p className="text-xs text-zinc-400">
              Yields chunk-by-chunk JSON packets as each sentence finishes synthesis. Ideal for real-time speech playback with &lt;200ms latency.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-1">
              Payload: <code className="text-zinc-300">{"['<text>', '<voice_id>', <speed>, '<api_key>']"}</code>
            </div>
          </div>

          {/* Endpoint 2 */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">POST</span>
              <code className="text-xs font-mono text-zinc-100 font-semibold">/gradio_api/call/generate_gpu_b64</code>
              <span className="text-[10px] text-zinc-500 font-mono ml-auto">Full WAV Audio</span>
            </div>
            <p className="text-xs text-zinc-400">
              Synthesizes complete input text and returns a full base64-encoded WAV PCM 24kHz audio string.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-1">
              Payload: <code className="text-zinc-300">{"['<text>', '<voice_id>', <speed>, '<api_key>']"}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Catalog Reference */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Voice Model Catalog</h3>
        <p className="text-xs text-zinc-400">Use any of the following voice identifier IDs in your API payload:</p>

        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th className="py-2.5 px-4 font-semibold text-zinc-400">Voice ID</th>
                <th className="py-2.5 px-4 font-semibold text-zinc-400">Name</th>
                <th className="py-2.5 px-4 font-semibold text-zinc-400">Accent</th>
                <th className="py-2.5 px-4 font-semibold text-zinc-400">Gender</th>
                <th className="py-2.5 px-4 font-semibold text-zinc-400">Style</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40 font-mono text-[11px]">
              {VOICES.map(v => (
                <tr key={v.id} className="hover:bg-zinc-900/30">
                  <td className="py-2.5 px-4 text-violet-400 font-semibold">{v.id}</td>
                  <td className="py-2.5 px-4 text-zinc-200">{v.name}</td>
                  <td className="py-2.5 px-4 text-zinc-400">{v.accent}</td>
                  <td className="py-2.5 px-4 text-zinc-400">{v.gender}</td>
                  <td className="py-2.5 px-4 text-zinc-500 font-sans text-xs">{v.style}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
