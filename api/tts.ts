import { Constants, EdgeTTS } from "@andresaya/edge-tts";
import type { ApiRequest, ApiResponse } from "./types.js";
import { allowRequest, allowTrustedOrigin, finishPreflight, requirePost } from "./_http.js";

const EDGE_VOICE = "en-US-AriaNeural";
const MAX_TEXT_LENGTH = 1800;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowTrustedOrigin(req, res) || finishPreflight(req, res) || !requirePost(req, res)) return;
  if (!allowRequest(req, res, "edge-tts", 80, 10 * 60_000)) return;

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  const request = parseSpeechRequest(body);
  if (!request) {
    res.status(400).json({ error: "የድምፅ ጥያቄው ትክክል አይደለም።" });
    return;
  }

  try {
    const tts = new EdgeTTS();
    await tts.synthesize(request.text, EDGE_VOICE, {
      rate: edgeRate(request.rate),
      volume: "100%",
      pitch: "+0Hz",
      outputFormat: Constants.OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3
    });
    const audio = tts.toBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audio.length);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
    res.statusCode = 200;
    res.end(audio);
  } catch (error) {
    console.error("Edge TTS synthesis failed", error);
    res.status(502).json({ error: "ድምፁን አሁን ማጫወት አልተቻለም።" });
  }
}

export function parseSpeechRequest(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const rate = Number(body.rate);
  if (!text || text.length > MAX_TEXT_LENGTH || !Number.isFinite(rate)) return null;
  return { text, rate: Math.min(1, Math.max(0.55, rate)) };
}

export function edgeRate(rate: number) {
  const percent = Math.round((Math.min(1, Math.max(0.55, rate)) - 1) * 100);
  return `${percent >= 0 ? "+" : ""}${percent}%`;
}
