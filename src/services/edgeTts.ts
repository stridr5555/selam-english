import { apiUrl } from "./api";

const MAX_CACHE_SIZE = 80;
const audioCache = new Map<string, ArrayBuffer>();
let audioContext: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;

export function speakText(text: string, rate = 0.72) {
  const context = getAudioContext();
  void context.resume().then(() => playEdgeSpeech(context, text, rate)).catch(() => {
    playBrowserFallback(text, rate);
  });
  return true;
}

export function edgeSpeechCacheKey(text: string, rate: number) {
  return `${Math.round(Math.min(1, Math.max(0.55, rate)) * 100)}:${text.trim()}`;
}

async function playEdgeSpeech(context: AudioContext, text: string, rate: number) {
  const normalizedText = text.trim();
  if (!normalizedText) return;
  const key = edgeSpeechCacheKey(normalizedText, rate);
  let encoded = audioCache.get(key);
  if (!encoded) {
    const response = await fetch(apiUrl("/api/tts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: normalizedText, rate })
    });
    if (!response.ok) throw new Error("Edge TTS request failed.");
    encoded = await response.arrayBuffer();
    rememberAudio(key, encoded);
  }

  activeSource?.stop();
  const buffer = await context.decodeAudioData(encoded.slice(0));
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start();
  activeSource = source;
  source.onended = () => {
    if (activeSource === source) activeSource = null;
  };
}

function getAudioContext() {
  audioContext ??= new AudioContext();
  return audioContext;
}

function rememberAudio(key: string, audio: ArrayBuffer) {
  if (audioCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = audioCache.keys().next().value as string | undefined;
    if (oldestKey) audioCache.delete(oldestKey);
  }
  audioCache.set(key, audio);
}

function playBrowserFallback(text: string, rate: number) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}
