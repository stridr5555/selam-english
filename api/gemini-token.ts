import { GoogleGenAI, Modality } from "@google/genai";
import type { ApiRequest, ApiResponse } from "./types.js";
import { allowRequest, allowTrustedOrigin, finishPreflight, requirePost } from "./_http.js";

const LIVE_MODEL = "gemini-3.1-flash-live-preview";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (!allowTrustedOrigin(req, res) || finishPreflight(req, res) || !requirePost(req, res)) return;
  if (!allowRequest(req, res, "gemini-live", 8, 5 * 60_000)) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Voice practice is not configured." });
    return;
  }

  try {
    const client = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });
    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(Date.now() + 20 * 60_000).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 60_000).toISOString(),
        liveConnectConstraints: {
          model: LIVE_MODEL,
          config: {
            responseModalities: [Modality.AUDIO]
          }
        },
        httpOptions: { apiVersion: "v1alpha" }
      }
    });

    res.status(200).json({ name: token.name, model: LIVE_MODEL });
  } catch (error) {
    console.error("Gemini token creation failed", error);
    res.status(502).json({ error: "Gemini voice service is unavailable." });
  }
}
