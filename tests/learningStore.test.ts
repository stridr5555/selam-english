import { describe, expect, it } from "vitest";
import { learningSequence } from "../src/App";
import {
  defaultProgress,
  learningReducer
} from "../src/state/learningStore";

describe("learning progress", () => {
  it("records a completed speaking word once and queues it for review", () => {
    const first = learningReducer(defaultProgress, {
      type: "complete-speaking",
      word: "coffee",
      minutes: 5
    });
    const second = learningReducer(first, {
      type: "complete-speaking",
      word: "coffee",
      minutes: 5
    });

    expect(second.learnedWords).toEqual(["coffee"]);
    expect(second.reviewQueue).toEqual(["coffee"]);
    expect(second.mastery.coffee).toBe(2);
    expect(second.totalSpeakingMinutes).toBe(10);
    expect(second.streakCount).toBe(1);
  });

  it("removes a mastered word from review", () => {
    const queued = {
      ...defaultProgress,
      reviewQueue: ["water"],
      mastery: { water: 2 }
    };
    const result = learningReducer(queued, {
      type: "rate-word",
      word: "water",
      rating: 5
    });

    expect(result.mastery.water).toBe(5);
    expect(result.reviewQueue).toEqual([]);
  });

  it("keeps the best reading score", () => {
    const first = learningReducer(defaultProgress, {
      type: "complete-reading",
      lessonId: "market-morning",
      score: 3,
      minutes: 6
    });
    const second = learningReducer(first, {
      type: "complete-reading",
      lessonId: "market-morning",
      score: 1,
      minutes: 6
    });

    expect(second.completedReadingIds).toEqual(["market-morning"]);
    expect(second.readingScores["market-morning"]).toBe(3);
  });
});

describe("speaking curriculum", () => {
  it("contains exactly 5,000 unique spoken words", () => {
    expect(learningSequence).toHaveLength(5000);
    expect(new Set(learningSequence).size).toBe(5000);
  });

  it("starts with the curated gradual lesson sequence", () => {
    expect(learningSequence.slice(0, 8)).toEqual([
      "coffee",
      "water",
      "work",
      "home",
      "bus",
      "food",
      "help",
      "family"
    ]);
  });
});
