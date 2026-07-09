import { createFallbackLesson } from "../data/curriculum";
import type { Level, SpeakingLesson } from "../types/learning";
import { apiUrl } from "./api";

const lessonCache = new Map<string, SpeakingLesson>();
const levels: Level[] = ["beginner", "intermediate", "advanced"];

export async function getGeneratedLesson(
  word: string,
  rank: number,
  level: Level
): Promise<SpeakingLesson> {
  const cacheKey = `${word}:${level}`;
  const memoryValue = lessonCache.get(cacheKey);
  if (memoryValue) return memoryValue;

  const localValue = readLocal(cacheKey);
  if (localValue) {
    lessonCache.set(cacheKey, localValue);
    return localValue;
  }

  try {
    const response = await fetch(apiUrl("/api/lesson"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, rank, level })
    });
    if (!response.ok) throw new Error("Lesson service unavailable");
    const lesson = (await response.json()) as SpeakingLesson;
    lessonCache.set(cacheKey, lesson);
    localStorage.setItem(`selam-lesson:${cacheKey}`, JSON.stringify(lesson));
    return lesson;
  } catch {
    return createFallbackLesson(word, rank);
  }
}

export function getCachedLessonForReview(word: string, preferredLevel: Level) {
  const orderedLevels = [preferredLevel, ...levels.filter((level) => level !== preferredLevel)];
  for (const level of orderedLevels) {
    const cacheKey = `${word}:${level}`;
    const lesson = lessonCache.get(cacheKey) ?? readLocal(cacheKey);
    if (lesson) {
      lessonCache.set(cacheKey, lesson);
      return lesson;
    }
  }
  return null;
}

function readLocal(cacheKey: string) {
  try {
    const value = localStorage.getItem(`selam-lesson:${cacheKey}`);
    return value ? (JSON.parse(value) as SpeakingLesson) : null;
  } catch {
    return null;
  }
}
