import { describe, expect, it } from "vitest";
import { englishToAmharicPronunciation } from "../src/services/amharicPronunciation";
import {
  appendTranscriptChunk,
  buildGeminiKickoffInstruction,
  buildGeminiSystemInstruction,
  normalizeTranscript
} from "../src/services/geminiVoice";
import type { SpeakingLesson } from "../src/types/learning";

const waterLesson: SpeakingLesson = {
  id: "water",
  rank: 2,
  word: "water",
  ipa: "/ˈwɔːtər/",
  amharic: "ውሃ",
  transliteration: "wuha",
  visual: "water",
  phrase: "a glass of water",
  shortSentence: "I need water.",
  longSentence: "Could I have a glass of water, please?",
  meaningAmharic: "ውሃ",
  grammarAmharic: "",
  pronunciationTipAmharic: "",
  conversationPrompt: "Practice asking for water politely in a cafe. Offer cold, warm, or sparkling water.",
  topic: "At a cafe"
};

describe("Gemini transcript assembly", () => {
  it("restores missing spaces between streamed English chunks", () => {
    expect(appendTranscriptChunk("I need", "to buy")).toBe("I need to buy");
  });

  it("restores missing spaces between streamed Amharic chunks", () => {
    expect(appendTranscriptChunk("አሁን በትክክል", "አግኝተውታል።")).toBe(
      "አሁን በትክክል አግኝተውታል።"
    );
  });

  it("handles cumulative chunks and punctuation", () => {
    expect(appendTranscriptChunk("I need", "I need water")).toBe("I need water");
    expect(appendTranscriptChunk("I need water", ".")).toBe("I need water.");
    expect(normalizeTranscript("  I   need water .  ")).toBe("I need water.");
  });

  it("separates English and Amharic when Gemini omits script-boundary spaces", () => {
    expect(normalizeTranscript('አሁን ያዳምጡ።"I need water."')).toBe(
      'አሁን ያዳምጡ። "I need water."'
    );
    expect(normalizeTranscript('"water"አሁን ይድገሙ።')).toBe('"water" አሁን ይድገሙ።');
  });
});

describe("voice lesson structure", () => {
  it("locks the coach to the current water target and sequence", () => {
    const context = {
      learnerName: "Mimi",
      learnerLevel: "beginner",
      lesson: waterLesson,
      step: "short",
      reviewWords: []
    } as const;
    const prompt = buildGeminiSystemInstruction(context);
    expect(prompt).toContain('exact target "I need water."');
    expect(prompt).toContain("3. USE IT");
    expect(prompt).toContain("Never ask the learner to repeat a new random phrase");
    expect(prompt).toContain("groceries");
    expect(buildGeminiKickoffInstruction(context)).toContain(
      'brief Amharic instruction about the At a cafe scenario'
    );
    expect(buildGeminiKickoffInstruction(context)).toContain('say exactly "I need water." once');
  });
});

describe("Amharic-script pronunciation", () => {
  it("renders the water practice sentences", () => {
    expect(englishToAmharicPronunciation("I need water.")).toBe("አይ ኒድ ዋተር");
    expect(englishToAmharicPronunciation("Could I have a glass of water, please?")).toBe(
      "ኩድ አይ ሃቭ አ ግላስ ኦቭ ዋተር ፕሊዝ"
    );
  });

  it("renders the first daily lesson without fallback spelling", () => {
    expect(englishToAmharicPronunciation("I drink a cup of coffee every morning.")).toBe(
      "አይ ድሪንክ አ ካፕ ኦቭ ኮፊ ኤቭሪ ሞርኒንግ"
    );
  });

  it("extracts English pronunciation from a mixed transcript", () => {
    expect(englishToAmharicPronunciation('እንደገና ይበሉ። "I need water."')).toBe("አይ ኒድ ዋተር");
  });
});
