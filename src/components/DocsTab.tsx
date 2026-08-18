import { useState } from 'react'
import { CodeBlock } from './CodeBlock'
import { VOICES } from '../lib/tts'
import { Terminal, Code2, Globe, Sparkles, Shield, Cpu, Layers, Server, KeyRound, AlertTriangle, FileCode } from 'lucide-react'

// --- Code Examples Branded with voice.axiogen.in ---

const REACT_HOOK_CODE = `// useAxiogenTTS.ts — Drop-in React / Next.js Hook
import { useState, useRef, useCallback } from 'react';

const API_BASE = 'https://voice.axiogen.in/api';

export function useAxiogenTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, voice = 'af_bella', speed = 1.0, apiKey = 'YOUR_API_KEY') => {
    if (!text.trim()) return;
    setIsSpeaking(true);
    setError(null);

    try {
      // 1. Submit synthesis task to Axiogen API Gateway
      const initRes = await fetch(\`\${API_BASE}/gradio_api/call/generate_gpu_b64\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [text, voice, speed, apiKey] })
      });
      if (!initRes.ok) throw new Error(\`Engine error (\${initRes.status})\`);
      const { event_id } = await initRes.json();

      // 2. Stream base64 audio payload
      const streamRes = await fetch(\`\${API_BASE}/gradio_api/call/generate_gpu_b64/\${event_id}\`);
      const streamText = await streamRes.text();

      for (const line of streamText.split('\\n')) {
        if (line.startsWith('data:')) {
          const [base64Wav] = JSON.parse(line.slice(5));
          if (audioRef.current) audioRef.current.pause();

          const audio = new Audio(\`data:audio/wav;base64,\${base64Wav}\`);
          audioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          await audio.play();
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Speech generation failed');
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking, error };
}`

const JS_STREAMING_CODE = `// Real-Time SSE Chunk-by-Chunk Streaming (Web Audio API)
async function streamSpeechLive(text, voice = 'af_bella', speed = 1.0, apiKey = 'YOUR_API_KEY') {
  const API_BASE = 'https://voice.axiogen.in/api';
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
  let nextStartTime = audioCtx.currentTime + 0.05;
  const processed = new Set();

  // 1. Initiate Streaming Connection
  const init = await fetch(\`\${API_BASE}/gradio_api/call/stream_tts\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [text, voice, speed, apiKey] })
  });
  const { event_id } = await init.json();

  // 2. Read SSE Chunks as they arrive
  const stream = await fetch(\`\${API_BASE}/gradio_api/call/stream_tts/\${event_id}\`);
  const reader = stream.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const raw = JSON.parse(line.slice(5).trim());
        const chunk = typeof raw[0] === 'string' ? JSON.parse(raw[0]) : raw[0];

        if (chunk?.audio && !processed.has(chunk.index)) {
          processed.add(chunk.index);
          console.log(\`Received chunk \${chunk.index}: "\${chunk.text}" (\${chunk.duration}s)\`);

          // Decode base64 to AudioBuffer and play immediately
          const binary = atob(chunk.audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

          const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);

          if (nextStartTime < audioCtx.currentTime) nextStartTime = audioCtx.currentTime + 0.02;
          source.start(nextStartTime);
          nextStartTime += audioBuffer.duration;
        }
      }
    }
  }
}`

const NODE_BACKEND_CODE = `// Node.js (CommonJS / ESM) — Generate and save .wav file
const fs = require('fs');

async function synthesizeToFile(text, outputFile = 'output.wav', apiKey = 'YOUR_API_KEY') {
  const API_BASE = 'https://voice.axiogen.in/api';

  const initRes = await fetch(\`\${API_BASE}/gradio_api/call/generate_gpu_b64\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [text, 'af_bella', 1.0, apiKey] })
  });

  const { event_id } = await initRes.json();
  const streamRes = await fetch(\`\${API_BASE}/gradio_api/call/generate_gpu_b64/\${event_id}\`);
  const textStream = await streamRes.text();

  for (const line of textStream.split('\\n')) {
    if (line.startsWith('data:')) {
      const [base64Wav] = JSON.parse(line.slice(5));
      const buffer = Buffer.from(base64Wav, 'base64');
      fs.writeFileSync(outputFile, buffer);
      console.log(\`Audio saved successfully to \${outputFile}\`);
      return;
    }
  }
}

synthesizeToFile("Welcome to Axiogen Voice Pro Enterprise.");`

const PYTHON_REQUESTS_CODE = `# Python — Pure requests without dependencies
import requests, json, base64

API_BASE = "https://voice.axiogen.in/api"
API_KEY = "YOUR_API_KEY"

def synthesize_speech(text, voice="af_bella", speed=1.0, output_path="speech.wav"):
    # 1. Post generation task to Axiogen API Gateway
    res1 = requests.post(
        f"{API_BASE}/gradio_api/call/generate_gpu_b64",
        json={"data": [text, voice, speed, API_KEY]}
    )
    event_id = res1.json()["event_id"]

    # 2. Get synthesized WAV
    res2 = requests.get(f"{API_BASE}/gradio_api/call/generate_gpu_b64/{event_id}")
    for line in res2.text.splitlines():
        if line.startswith("data:"):
            b64_audio = json.loads(line[5:])[0]
            with open(output_path, "wb") as f:
                f.write(base64.b64decode(b64_audio))
            print(f"Saved audio -> {output_path}")
            return

synthesize_speech("High quality neural text to speech engine.")`

const CURL_SNIPPET = `# Step 1: Submit synthesis job to voice.axiogen.in
curl -X POST https://voice.axiogen.in/api/gradio_api/call/generate_gpu_b64 \\
  -H "Content-Type: application/json" \\
  -d '{"data": ["Hello world from cURL", "af_bella", 1.0, "YOUR_API_KEY"]}'

# Response: {"event_id": "xxx"}

# Step 2: Fetch result WAV stream
curl -N https://voice.axiogen.in/api/gradio_api/call/generate_gpu_b64/<event_id>`

const GO_CODE = `package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

func main() {
	apiBase := "https://voice.axiogen.in/api"
	apiKey := "YOUR_API_KEY"
	text := "Speech synthesis via Golang"

	// 1. Submit task
	payload, _ := json.Marshal(map[string]interface{}{
		"data": []interface{}{text, "af_bella", 1.0, apiKey},
	})
	resp, _ := http.Post(apiBase+"/gradio_api/call/generate_gpu_b64", "application/json", bytes.NewBuffer(payload))
	var initData map[string]string
	json.NewDecoder(resp.Body).Decode(&initData)

	// 2. Fetch audio
	resp2, _ := http.Get(apiBase + "/gradio_api/call/generate_gpu_b64/" + initData["event_id"])
	bodyBytes, _ := io.ReadAll(resp2.Body)

	for _, line := range strings.Split(string(bodyBytes), "\\n") {
		if strings.HasPrefix(line, "data:") {
			var dataArr []string
			json.Unmarshal([]byte(line[5:]), &dataArr)
			audioBytes, _ := base64.StdEncoding.DecodeString(dataArr[0])
			os.WriteFile("speech.wav", audioBytes, 0644)
			fmt.Println("Audio saved -> speech.wav")
			return
		}
	}
}`

export function DocsTab() {
  const [activeLang, setActiveLang] = useState<'react' | 'js_stream' | 'node' | 'python' | 'curl' | 'go'>('react')
  const [activeSection, setActiveSection] = useState<'quickstart' | 'endpoints' | 'voices' | 'auth' | 'specs'>('quickstart')

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">

      {/* Top Banner Header */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Axiogen Voice API Documentation</h1>
              <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/30">v2.0 Production</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Ultra-low latency streaming text-to-speech API gateway running on NVIDIA ZeroGPU 24kHz neural synthesis.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              <Shield className="w-3.5 h-3.5" /> Strict Auth Enabled
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded-md">
              <Cpu className="w-3.5 h-3.5 text-violet-400" /> 24kHz FP16
            </span>
          </div>
        </div>

        {/* Global Connection Endpoints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold block">Production API Gateway Base URL</span>
            <code className="text-xs font-mono text-emerald-400 select-all block">https://voice.axiogen.in/api</code>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold block">Authentication Method</span>
            <code className="text-xs font-mono text-zinc-200 select-all block">api_key parameter (<code>teamaxiogen_admin_master</code> / <code>axg_...</code>)</code>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-3 overflow-x-auto">
        {[
          { id: 'quickstart', label: 'Quickstart & SDKs', icon: Code2 },
          { id: 'endpoints',  label: 'API Endpoints',    icon: Server },
          { id: 'voices',     label: '54-Voice Library', icon: Sparkles },
          { id: 'auth',       label: 'Authentication',   icon: KeyRound },
          { id: 'specs',      label: 'Audio Specs',      icon: Layers },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap
              ${activeSection === tab.id
                ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SECTION 1: QUICKSTART & SDKs */}
      {activeSection === 'quickstart' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-violet-400" />
                  <span>Integration SDKs & Code Examples</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Direct copy-pasteable examples using your branded endpoint <code>voice.axiogen.in</code>.</p>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1 flex-wrap">
                {[
                  { id: 'react', label: 'React / Next.js Hook', icon: Globe },
                  { id: 'js_stream', label: 'Streaming SSE', icon: Sparkles },
                  { id: 'node', label: 'Node.js', icon: Code2 },
                  { id: 'python', label: 'Python', icon: Terminal },
                  { id: 'curl', label: 'cURL', icon: Terminal },
                  { id: 'go', label: 'Golang', icon: Server },
                ].map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setActiveLang(l.id as any)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer
                      ${activeLang === l.id
                        ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                  >
                    <l.icon className="w-3 h-3 opacity-70" />
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Code Viewer */}
            <div className="pt-2">
              {activeLang === 'react' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Drop-in hook for any React / Next.js app connecting to <code>voice.axiogen.in</code>:</span>
                  </div>
                  <CodeBlock code={REACT_HOOK_CODE} language="typescript" />
                </div>
              )}
              {activeLang === 'js_stream' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Low latency sentence-by-sentence streaming playback via Web Audio API:</span>
                  </div>
                  <CodeBlock code={JS_STREAMING_CODE} language="javascript" />
                </div>
              )}
              {activeLang === 'node' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Server-side synthesis in Node.js to generate and save .wav audio files:</span>
                  </div>
                  <CodeBlock code={NODE_BACKEND_CODE} language="javascript" />
                </div>
              )}
              {activeLang === 'python' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Direct Python HTTP synthesis using standard requests:</span>
                  </div>
                  <CodeBlock code={PYTHON_REQUESTS_CODE} language="python" />
                </div>
              )}
              {activeLang === 'curl' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Standard cURL command pointing to <code>voice.axiogen.in</code>:</span>
                  </div>
                  <CodeBlock code={CURL_SNIPPET} language="bash" />
                </div>
              )}
              {activeLang === 'go' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Golang client to synthesize and save WAV speech from <code>voice.axiogen.in</code>:</span>
                  </div>
                  <CodeBlock code={GO_CODE} language="go" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ENDPOINTS */}
      {activeSection === 'endpoints' && (
        <div className="space-y-6">
          {/* Endpoint 1: Real-time Streaming */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">POST</span>
              <code className="text-sm font-mono text-white font-semibold">https://voice.axiogen.in/api/gradio_api/call/stream_tts</code>
              <span className="ml-auto text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">Chunk Streaming (SSE)</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Streams audio clause-by-clause over an SSE connection through the <code>voice.axiogen.in</code> API gateway.
            </p>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">Payload Parameters (Array Schema)</span>
              <div className="overflow-hidden rounded-lg border border-zinc-800">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950 font-mono text-zinc-400">
                      <th className="py-2 px-3">Position</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40 font-mono text-[11px]">
                    <tr>
                      <td className="py-2 px-3 text-zinc-500">data[0]</td>
                      <td className="py-2 px-3 text-violet-400 font-semibold">text</td>
                      <td className="py-2 px-3 text-zinc-400">string</td>
                      <td className="py-2 px-3 text-zinc-300 font-sans text-xs">Text to speak (up to 5,000 characters).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-zinc-500">data[1]</td>
                      <td className="py-2 px-3 text-violet-400 font-semibold">voice</td>
                      <td className="py-2 px-3 text-zinc-400">string</td>
                      <td className="py-2 px-3 text-zinc-300 font-sans text-xs">Voice ID (any of the 54 neural voices e.g. <code>af_bella</code>, <code>af_nicole</code>).</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-zinc-500">data[2]</td>
                      <td className="py-2 px-3 text-violet-400 font-semibold">speed</td>
                      <td className="py-2 px-3 text-zinc-400">float</td>
                      <td className="py-2 px-3 text-zinc-300 font-sans text-xs">Speaking rate between <code>0.5</code> and <code>2.0</code>. Default: <code>1.0</code>.</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-zinc-500">data[3]</td>
                      <td className="py-2 px-3 text-violet-400 font-semibold">api_key</td>
                      <td className="py-2 px-3 text-emerald-400 font-semibold">string</td>
                      <td className="py-2 px-3 text-zinc-300 font-sans text-xs">Axiogen API Token (<code>teamaxiogen_admin_master</code> or <code>axg_...</code>).</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Endpoint 2: Full Synchronous Audio */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">POST</span>
              <code className="text-sm font-mono text-white font-semibold">https://voice.axiogen.in/api/gradio_api/call/generate_gpu_b64</code>
              <span className="ml-auto text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">Complete Audio</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Synthesizes complete input text and returns a unified base64-encoded WAV PCM 24kHz string via <code>voice.axiogen.in</code>.
            </p>
            <div className="text-xs font-mono text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              Payload: <code className="text-zinc-200">{"{\"data\": [\"Text\", \"af_bella\", 1.0, \"YOUR_API_KEY\"]}"}</code>
            </div>
          </div>

          {/* Endpoint 3: Key Management API */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 text-xs font-bold text-violet-400">DATABASE</span>
              <h3 className="text-sm font-semibold text-white">Programmatic API Key Management</h3>
            </div>
            <p className="text-xs text-zinc-400">Manage user API keys directly via database endpoints on <code>voice.axiogen.in</code>:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Create Key</span>
                <code className="text-[11px] font-mono text-zinc-200 block">POST https://voice.axiogen.in/api/gradio_api/call/db_create_key</code>
                <span className="text-[10px] text-zinc-500 block">Payload: <code>['Key Name']</code></span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">List Keys</span>
                <code className="text-[11px] font-mono text-zinc-200 block">POST https://voice.axiogen.in/api/gradio_api/call/db_list_keys</code>
                <span className="text-[10px] text-zinc-500 block">Payload: <code>[]</code></span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1">
                <span className="text-[10px] font-bold text-red-400 uppercase">Revoke Key</span>
                <code className="text-[11px] font-mono text-zinc-200 block">POST https://voice.axiogen.in/api/gradio_api/call/db_revoke_key</code>
                <span className="text-[10px] text-zinc-500 block">Payload: <code>['key_id']</code></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: VOICES */}
      {activeSection === 'voices' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">54 Neural Voice Library</h2>
            <p className="text-xs text-zinc-400 mt-0.5">All 54 neural voices supported across American, British, Spanish, Hindi, French, Italian, Japanese, Chinese, and Portuguese:</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950 font-semibold text-zinc-400">
                  <th className="py-3 px-4">Voice ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Accent</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Style & Recommended Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40 font-mono text-[11px]">
                {VOICES.map(v => (
                  <tr key={v.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 text-violet-400 font-semibold">{v.id}</td>
                    <td className="py-3 px-4 text-zinc-200 font-sans font-medium">{v.name}</td>
                    <td className="py-3 px-4 text-zinc-400 font-sans">{v.accent}</td>
                    <td className="py-3 px-4 text-zinc-400 font-sans">{v.gender}</td>
                    <td className="py-3 px-4 text-zinc-300 font-sans text-xs">{v.style}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: AUTHENTICATION */}
      {activeSection === 'auth' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Strict Authentication Protocol</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Every request to Axiogen Voice Engine must contain a valid API key. Unauthorized requests are immediately blocked with zero GPU compute processed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <span className="text-xs font-semibold text-white block">Master Admin Token</span>
              <code className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded block select-all">
                teamaxiogen_admin_master
              </code>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Full administrative access with unlimited concurrency and bypass permissions.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-2">
              <span className="text-xs font-semibold text-white block">Application Tokens (Database Synced)</span>
              <code className="text-xs font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded block select-all">
                axg_00ee••••••••••••••••8f3f
              </code>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Generate dedicated tokens per client application in the <strong className="text-zinc-300">API Keys</strong> tab.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Unauthorized Request Error Response (401)</span>
            </div>
            <div className="font-mono text-xs text-red-300 bg-black/40 p-2.5 rounded border border-red-500/20">
              {`{ "error": "Unauthorized: Invalid or missing API key. Please provide a valid Axiogen API key." }`}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: SPECS */}
      {activeSection === 'specs' && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-white">Audio & Engine Specifications</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Technical specifications of the neural speech engine:</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-center">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Sampling Rate</div>
              <div className="font-mono text-lg font-bold text-white mt-1">24,000 Hz</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">24kHz High-Fidelity</div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-center">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Audio Container</div>
              <div className="font-mono text-lg font-bold text-white mt-1">WAV (PCM 16)</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Uncompressed RIFF</div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-center">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Channels</div>
              <div className="font-mono text-lg font-bold text-white mt-1">Mono (1.0)</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Optimized for Voice</div>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-center">
              <div className="text-[10px] font-mono uppercase text-zinc-500">Hardware Accel</div>
              <div className="font-mono text-lg font-bold text-emerald-400 mt-1">RTX 6000 Ada</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">FP16 CUDA Execution</div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
