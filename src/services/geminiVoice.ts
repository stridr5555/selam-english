import type { LiveServerMessage, Session } from "@google/genai";
import type { SpeakingLesson, SpeakingStep } from "../types/learning";
import { apiUrl } from "./api";

export type VoiceStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

export type VoiceTurn = {
  id: string;
  speaker: "learner" | "coach";
  text: string;
};

export type VoiceCoachCallbacks = {
  onStatus: (status: VoiceStatus, message: string) => void;
  onTurn: (turn: VoiceTurn) => void;
  onTranscript: (turn: VoiceTurn | null) => void;
  onLevel: (level: number) => void;
};

export type VoicePracticeContext = {
  learnerName: string;
  learnerLevel: string;
  lesson: SpeakingLesson;
  step: SpeakingStep;
  reviewWords: string[];
};

export function buildGeminiSystemInstruction(context: VoicePracticeContext) {
  const currentTarget = getStepText(context.lesson, context.step);
  return [
    "You are Selam English, an adaptive voice teacher for an adult Amharic speaker.",
    `This session is locked to the topic \"${context.lesson.topic}\" and the learning target \"${currentTarget}\".`,
    `The scenario is: ${context.lesson.conversationPrompt}`,
    "Use clear Amharic for teaching and feedback. Use short English examples only when they directly support the target and scenario.",
    "Do not introduce shopping, groceries, travel, or any unrelated example unless it is the stated lesson topic.",
    "Keep Amharic and English as separate, complete sentences with normal spacing and punctuation.",
    "Ask one meaningful question, then wait. Keep each response under 45 words.",
    "Respond to the learner's actual answer. Do not deliver a memorized script or repeat the same instruction.",
    "Do not ask for exact repetition unless the learner has a specific pronunciation problem that needs one focused retry.",
    "Let the learner make choices, change details, and express a real preference or need.",
    "If the learner is stuck, offer two short choices or a sentence starter. Accept an Amharic answer, then help them express it in English.",
    "Correct only the most useful pronunciation or grammar issue in each turn.",
    "When correcting pronunciation, give a simple mouth or tongue instruction in Amharic, then model the English word once.",
    "Move through this teaching cycle at the learner's pace without announcing the stage names:",
    "1. UNDERSTAND: Explain the meaning and useful situation in Amharic. Give one natural English example. Ask a context or meaning-check question, not a repetition request.",
    "2. NOTICE: Teach one useful feature of the target. Ask the learner to choose, complete, sort, or change one meaningful part.",
    "3. CREATE: Ask a personal question that requires the learner to adapt the target to their own life, preference, or need.",
    "4. CONVERSATION: Use the same scenario for two to four natural exchanges. React to the learner's details instead of forcing a fixed answer.",
    "5. FEEDBACK: Name one thing the learner did well and one next improvement in Amharic. Finish with a useful follow-up question or a clear completion message.",
    buildStageTeachingPlan(context),
    "Never replace the target with an unrelated sentence. Related variations are allowed only when they teach how the target works.",
    `Learner: ${context.learnerName || "Learner"}. Level: ${context.learnerLevel}.`,
    `Target word: ${context.lesson.word}. Target phrase: ${context.lesson.phrase}.`,
    `Target short sentence: ${context.lesson.shortSentence}`,
    `Target long sentence: ${context.lesson.longSentence}`,
    `Current curriculum stage: ${context.step}. Current learning target: ${currentTarget}.`,
    `Review words when natural: ${context.reviewWords.slice(0, 4).join(", ") || "none"}.`,
    "Start at UNDERSTAND now."
  ].join("\n");
}

export function buildStageTeachingPlan(context: VoicePracticeContext) {
  const lesson = context.lesson;
  if (context.step === "word") {
    return `WORD LESSON: Teach what \"${lesson.word}\" means, contrast it with one easy non-example, show one common combination, then help the learner use it for a real need in the scenario.`;
  }
  if (context.step === "phrase") {
    return `PHRASE LESSON: Teach \"${lesson.phrase}\" as one useful chunk. Show how the word \"${lesson.word}\" works inside it, then let the learner substitute one detail before using the phrase in the scenario.`;
  }
  if (context.step === "short") {
    return `SHORT-SENTENCE LESSON: Teach the pattern in \"${lesson.shortSentence}\" and its connection to \"${lesson.phrase}\". Let the learner change one meaningful part, then answer a personal question with the pattern.`;
  }
  return `LONG-SENTENCE LESSON: Teach the thought groups, connector or polite intent in \"${lesson.longSentence}\". Build from \"${lesson.shortSentence}\", let the learner personalize one detail, then use the full idea naturally in the scenario.`;
}

export function appendTranscriptChunk(existing: string, chunk: string) {
  if (!chunk) return existing;
  if (!existing) return chunk;
  if (chunk.startsWith(existing)) return chunk;
  if (existing.endsWith(chunk)) return existing;
  if (/^\s/.test(chunk) || /\s$/.test(existing)) return existing + chunk;
  if (/^[,.;:!?…’”)}\]]/.test(chunk)) return existing + chunk;
  if (/[([{“‘\"]$/.test(existing)) return existing + chunk;
  return `${existing} ${chunk}`;
}

export function normalizeTranscript(text: string) {
  return text
    .replace(/\s+([,.;:!?…])/g, "$1")
    .replace(/([([{“‘\"])\s+/g, "$1")
    .replace(/([\u1200-\u137f])([\"“]?[A-Za-z])/g, "$1 $2")
    .replace(/([A-Za-z][\"”']?)([\u1200-\u137f])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildGeminiKickoffInstruction(context: VoicePracticeContext) {
  const currentTarget = getStepText(context.lesson, context.step);
  return [
    "Start UNDERSTAND now.",
    `In Amharic, explain what \"${currentTarget}\" means and when it is useful in the ${context.lesson.topic} scenario.`,
    `Use \"${currentTarget}\" once in a natural English example.`,
    "Then ask one simple context or meaning-check question and wait.",
    "Do not ask the learner to repeat the target."
  ].join(" ");
}

export class GeminiVoiceCoach {
  private callbacks: VoiceCoachCallbacks;
  private session: Session | null = null;
  private stream: MediaStream | null = null;
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputSources = new Set<AudioBufferSourceNode>();
  private nextOutputTime = 0;
  private closed = false;
  private learnerText = "";
  private coachText = "";

  constructor(callbacks: VoiceCoachCallbacks) {
    this.callbacks = callbacks;
  }

  async start(context: VoicePracticeContext) {
    this.closed = false;
    this.callbacks.onStatus("connecting", "ከጄሚኒ የድምፅ አሰልጣኝ ጋር በመገናኘት ላይ…");

    const permissionStream = await requestMicrophone();
    if (this.closed) {
      permissionStream.getTracks().forEach((track) => track.stop());
      return;
    }
    this.stream = permissionStream;

    const tokenResponse = await fetch(apiUrl("/api/gemini-token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: context.lesson.id })
    });
    if (!tokenResponse.ok) {
      const payload = (await tokenResponse.json().catch(() => null)) as
        | { error?: string }
        | null;
      throw new Error(payload?.error || "ከድምፅ አሰልጣኙ ጋር መገናኘት አልተቻለም።");
    }
    const token = (await tokenResponse.json()) as { name: string; model: string };
    if (this.closed) return;

    const { GoogleGenAI, Modality } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: token.name, httpOptions: { apiVersion: "v1alpha" } });
    const instruction = buildGeminiSystemInstruction(context);

    this.outputContext = new AudioContext({ sampleRate: 24_000 });
    await this.outputContext.resume();

    this.session = await ai.live.connect({
      model: token.model,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: instruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        temperature: 0.6,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
        }
      },
      callbacks: {
        onopen: () => {
          if (!this.closed) {
            this.callbacks.onStatus("listening", "እያዳመጠ ነው። ዝግጁ ሲሆኑ በእንግሊዝኛ ይናገሩ።");
          }
        },
        onmessage: (message) => this.handleMessage(message),
        onerror: () => {
          if (!this.closed) this.callbacks.onStatus("error", "የድምፅ ግንኙነቱ ተቋርጧል።");
        },
        onclose: () => {
          if (!this.closed) this.callbacks.onStatus("idle", "የድምፅ ልምምዱ ተጠናቋል።");
        }
      }
    });

    if (this.closed) {
      this.session.close();
      this.session = null;
      return;
    }
    await this.startMicrophoneStream();
    this.session.sendClientContent({
      turns: buildGeminiKickoffInstruction(context),
      turnComplete: true
    });
  }

  stop() {
    this.closed = true;
    this.processor?.disconnect();
    this.inputSource?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.session?.sendRealtimeInput({ audioStreamEnd: true });
    this.session?.close();
    this.stopOutput();
    void this.inputContext?.close();
    void this.outputContext?.close();
    this.processor = null;
    this.inputSource = null;
    this.stream = null;
    this.session = null;
    this.inputContext = null;
    this.outputContext = null;
    this.callbacks.onLevel(0);
    this.callbacks.onTranscript(null);
    this.callbacks.onStatus("idle", "የድምፅ አሰልጣኙ ዝግጁ ነው።");
  }

  private async startMicrophoneStream() {
    if (!this.stream || !this.session) return;
    this.inputContext = new AudioContext();
    await this.inputContext.resume();
    this.inputSource = this.inputContext.createMediaStreamSource(this.stream);
    this.processor = this.inputContext.createScriptProcessor(2048, 1, 1);

    const silentGain = this.inputContext.createGain();
    silentGain.gain.value = 0;
    this.inputSource.connect(this.processor);
    this.processor.connect(silentGain);
    silentGain.connect(this.inputContext.destination);

    this.processor.onaudioprocess = (event) => {
      if (!this.session || this.closed) return;
      const input = event.inputBuffer.getChannelData(0);
      const level = rootMeanSquare(input);
      this.callbacks.onLevel(Math.min(1, level * 8));
      const pcm = resampleToPcm16(input, this.inputContext?.sampleRate ?? 48_000, 16_000);
      this.session.sendRealtimeInput({
        audio: { data: bytesToBase64(new Uint8Array(pcm.buffer)), mimeType: "audio/pcm;rate=16000" }
      });
    };
  }

  private handleMessage(message: LiveServerMessage) {
    const content = message.serverContent;
    if (!content) return;

    if (content.interrupted) this.stopOutput();

    const inputText = content.inputTranscription?.text;
    if (inputText) {
      this.learnerText = appendTranscriptChunk(this.learnerText, inputText);
      this.callbacks.onTranscript({
        id: "live-learner",
        speaker: "learner",
        text: normalizeTranscript(this.learnerText)
      });
      this.callbacks.onStatus("thinking", "ጄሚኒ መልስዎን እያዳመጠ ነው…");
    }

    const outputText = content.outputTranscription?.text;
    if (outputText) {
      this.coachText = appendTranscriptChunk(this.coachText, outputText);
      this.callbacks.onTranscript({
        id: "live-coach",
        speaker: "coach",
        text: normalizeTranscript(this.coachText)
      });
      this.callbacks.onStatus("speaking", "ጄሚኒ እየመለሰ ነው።");
    }

    for (const part of content.modelTurn?.parts ?? []) {
      if (part.inlineData?.data) {
        this.playPcm(part.inlineData.data, sampleRateFromMime(part.inlineData.mimeType));
      }
    }

    if (content.turnComplete) {
      if (this.learnerText.trim()) {
        this.callbacks.onTurn({ id: crypto.randomUUID(), speaker: "learner", text: normalizeTranscript(this.learnerText) });
      }
      if (this.coachText.trim()) {
        this.callbacks.onTurn({ id: crypto.randomUUID(), speaker: "coach", text: normalizeTranscript(this.coachText) });
      }
      this.learnerText = "";
      this.coachText = "";
      this.callbacks.onTranscript(null);
      this.callbacks.onStatus("listening", "የእርስዎ ተራ ነው። ዝግጁ ሲሆኑ ይናገሩ።");
    }
  }

  private playPcm(base64: string, sampleRate: number) {
    if (!this.outputContext || this.closed) return;
    const bytes = base64ToBytes(base64);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const sampleCount = Math.floor(bytes.byteLength / 2);
    const buffer = this.outputContext.createBuffer(1, sampleCount, sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < sampleCount; index += 1) {
      channel[index] = view.getInt16(index * 2, true) / 32_768;
    }

    const source = this.outputContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputContext.destination);
    const startAt = Math.max(this.outputContext.currentTime + 0.04, this.nextOutputTime);
    source.start(startAt);
    this.nextOutputTime = startAt + buffer.duration;
    this.outputSources.add(source);
    source.onended = () => this.outputSources.delete(source);
  }

  private stopOutput() {
    for (const source of this.outputSources) {
      try {
        source.stop();
      } catch {
        // The source may have already ended.
      }
    }
    this.outputSources.clear();
    this.nextOutputTime = this.outputContext?.currentTime ?? 0;
  }
}

export async function requestMicrophone() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("ይህ አሳሽ ማይክሮፎን መጠቀም አይችልም።");
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
  } catch {
    throw new Error("የድምፅ ልምምድ ለመጀመር የማይክሮፎን ፈቃድ ይስጡ።");
  }
}

function getStepText(lesson: SpeakingLesson, step: SpeakingStep) {
  if (step === "word") return lesson.word;
  if (step === "phrase") return lesson.phrase;
  if (step === "short") return lesson.shortSentence;
  return lesson.longSentence;
}

function rootMeanSquare(buffer: Float32Array) {
  let sum = 0;
  for (const sample of buffer) sum += sample * sample;
  return Math.sqrt(sum / buffer.length);
}

function resampleToPcm16(input: Float32Array, inputRate: number, outputRate: number) {
  const ratio = inputRate / outputRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Int16Array(outputLength);
  for (let index = 0; index < outputLength; index += 1) {
    const start = Math.floor(index * ratio);
    const end = Math.min(input.length, Math.floor((index + 1) * ratio));
    let total = 0;
    for (let cursor = start; cursor < end; cursor += 1) total += input[cursor];
    const sample = Math.max(-1, Math.min(1, total / Math.max(1, end - start)));
    output[index] = sample < 0 ? sample * 32_768 : sample * 32_767;
  }
  return output;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function sampleRateFromMime(mimeType?: string) {
  const match = mimeType?.match(/rate=(\d+)/);
  return match ? Number(match[1]) : 24_000;
}
