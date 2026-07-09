import { GoogleGenAI, Type } from "@google/genai";
import type { ApiRequest, ApiResponse } from "./types.js";
import { allowRequest, allowTrustedOrigin, finishPreflight, requirePost } from "./_http.js";

const visualKeys = [
  "coffee",
  "water",
  "work",
  "home",
  "bus",
  "food",
  "family",
  "market",
  "classroom",
  "health",
  "phone",
  "city"
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "private, max-age=86400");
  if (!allowTrustedOrigin(req, res) || finishPreflight(req, res) || !requirePost(req, res)) return;
  if (!allowRequest(req, res, "lesson", 20, 60 * 60_000)) return;

  let body: unknown;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: "Invalid JSON body." });
    return;
  }
  const requestBody = body as Record<string, unknown> | undefined;
  const word = typeof requestBody?.word === "string" ? requestBody.word.trim().toLowerCase() : "";
  const rank = Number(requestBody?.rank);
  const level = requestBody?.level;
  if (!/^[a-z]{1,18}$/.test(word) || !Number.isInteger(rank) || rank < 1 || rank > 5000) {
    res.status(400).json({ error: "Invalid lesson request." });
    return;
  }
  if (typeof level !== "string" || !["beginner", "intermediate", "advanced"].includes(level)) {
    res.status(400).json({ error: "Invalid learner level." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Lesson generation is not configured." });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        "Create one practical spoken-English micro-lesson for an adult Amharic speaker.",
        `Target word: ${word}. Frequency rank in this curriculum: ${rank}. Learner level: ${level}.`,
        "Use natural modern Amharic. Keep English examples useful in daily life.",
        "The phrase must contain the target word. Build the short and long sentence gradually from that phrase.",
        "Choose the closest visual category from the allowed enum. Return only the requested JSON."
      ].join("\n"),
      config: {
        temperature: 0.25,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["ipa", "amharic", "transliteration", "visual", "phrase", "shortSentence", "longSentence", "meaningAmharic", "grammarAmharic", "pronunciationTipAmharic", "conversationPrompt", "topic"],
          properties: {
            ipa: { type: Type.STRING },
            amharic: { type: Type.STRING },
            transliteration: { type: Type.STRING },
            visual: { type: Type.STRING, enum: visualKeys },
            phrase: { type: Type.STRING },
            shortSentence: { type: Type.STRING },
            longSentence: { type: Type.STRING },
            meaningAmharic: { type: Type.STRING },
            grammarAmharic: { type: Type.STRING },
            pronunciationTipAmharic: { type: Type.STRING },
            conversationPrompt: { type: Type.STRING },
            topic: { type: Type.STRING }
          }
        }
      }
    });
    const generated = normalizeLesson(JSON.parse(response.text ?? "{}"), word);
    if (!generated) throw new Error("Gemini returned an invalid lesson.");
    res.status(200).json({
      ...generated,
      id: `generated-${word}`,
      rank,
      word
    });
  } catch (error) {
    console.error("Lesson generation failed", error);
    res.status(502).json({ error: "This lesson could not be prepared." });
  }
}

function normalizeLesson(value: unknown, targetWord: string) {
  if (!value || typeof value !== "object") return null;
  const lesson = value as Record<string, unknown>;
  const stringFields = [
    "ipa",
    "amharic",
    "transliteration",
    "phrase",
    "shortSentence",
    "longSentence",
    "meaningAmharic",
    "grammarAmharic",
    "pronunciationTipAmharic",
    "conversationPrompt",
    "topic"
  ];
  if (stringFields.some((field) => typeof lesson[field] !== "string" || !lesson[field].trim())) {
    return null;
  }
  if (!visualKeys.includes(String(lesson.visual))) return null;
  const examples = [lesson.phrase, lesson.shortSentence, lesson.longSentence]
    .map((item) => String(item).toLowerCase());
  if (examples.some((item) => !item.includes(targetWord))) return null;
  return lesson;
}
