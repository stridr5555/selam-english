import { describe, expect, it } from "vitest";
import { edgeRate, parseSpeechRequest } from "../api/tts";
import { edgeSpeechCacheKey } from "../src/services/edgeTts";

describe("Edge TTS request handling", () => {
  it("maps the learner speed to Edge prosody percentages", () => {
    expect(edgeRate(0.55)).toBe("-45%");
    expect(edgeRate(0.72)).toBe("-28%");
    expect(edgeRate(1)).toBe("+0%");
  });

  it("validates and clamps speech requests", () => {
    expect(parseSpeechRequest({ text: " water ", rate: 0.2 })).toEqual({ text: "water", rate: 0.55 });
    expect(parseSpeechRequest({ text: "", rate: 0.72 })).toBeNull();
    expect(parseSpeechRequest({ text: "water", rate: "bad" })).toBeNull();
  });

  it("uses the normalized rate and text as the audio cache key", () => {
    expect(edgeSpeechCacheKey(" water ", 0.72)).toBe("72:water");
    expect(edgeSpeechCacheKey("water", 2)).toBe("100:water");
  });
});
