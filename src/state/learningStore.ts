import type { LearnerProfile, LearningProgress, Level } from "../types/learning";

const STORAGE_KEY = "selam-english-progress-v2";

export const defaultProfile: LearnerProfile = {
  name: "",
  level: "beginner",
  dailyGoalMinutes: 15,
  reminderTime: "19:00",
  remindersEnabled: false,
  voiceRate: 0.72,
  onboardingComplete: false
};

export const defaultProgress: LearningProgress = {
  schemaVersion: 2,
  profile: defaultProfile,
  learnedWords: [],
  mastery: {},
  reviewQueue: [],
  completedReadingIds: [],
  readingScores: {},
  totalSpeakingMinutes: 0,
  totalReadingMinutes: 0,
  streakCount: 0,
  lastPracticeDate: null,
  weeklyActivity: {}
};

export type LearningAction =
  | { type: "complete-onboarding"; name: string; level: Level; goal: number }
  | { type: "update-profile"; updates: Partial<LearnerProfile> }
  | { type: "complete-speaking"; word: string; minutes?: number }
  | { type: "complete-reading"; lessonId: string; score: number; minutes: number }
  | { type: "rate-word"; word: string; rating: number }
  | { type: "queue-review"; word: string }
  | { type: "reset" };

export function learningReducer(
  state: LearningProgress,
  action: LearningAction
): LearningProgress {
  if (action.type === "reset") return defaultProgress;

  if (action.type === "complete-onboarding") {
    return {
      ...state,
      profile: {
        ...state.profile,
        name: action.name.trim() || "Learner",
        level: action.level,
        dailyGoalMinutes: action.goal,
        onboardingComplete: true
      }
    };
  }

  if (action.type === "update-profile") {
    return { ...state, profile: { ...state.profile, ...action.updates } };
  }

  if (action.type === "complete-speaking") {
    const today = dateKey(new Date());
    const learnedWords = state.learnedWords.includes(action.word)
      ? state.learnedWords
      : [...state.learnedWords, action.word];
    const reviewQueue = state.reviewQueue.includes(action.word)
      ? state.reviewQueue
      : [...state.reviewQueue, action.word];

    return {
      ...state,
      learnedWords,
      reviewQueue,
      mastery: {
        ...state.mastery,
        [action.word]: Math.max(state.mastery[action.word] ?? 0, 2)
      },
      totalSpeakingMinutes: state.totalSpeakingMinutes + (action.minutes ?? 4),
      ...practiceDates(state, today, action.minutes ?? 4)
    };
  }

  if (action.type === "complete-reading") {
    const today = dateKey(new Date());
    const completedReadingIds = state.completedReadingIds.includes(action.lessonId)
      ? state.completedReadingIds
      : [...state.completedReadingIds, action.lessonId];

    return {
      ...state,
      completedReadingIds,
      readingScores: {
        ...state.readingScores,
        [action.lessonId]: Math.max(state.readingScores[action.lessonId] ?? 0, action.score)
      },
      totalReadingMinutes: state.totalReadingMinutes + action.minutes,
      ...practiceDates(state, today, action.minutes)
    };
  }

  if (action.type === "rate-word") {
    const nextMastery = Math.max(0, Math.min(5, action.rating));
    return {
      ...state,
      mastery: { ...state.mastery, [action.word]: nextMastery },
      reviewQueue:
        nextMastery >= 4
          ? state.reviewQueue.filter((word) => word !== action.word)
          : state.reviewQueue.includes(action.word)
            ? state.reviewQueue
            : [...state.reviewQueue, action.word]
    };
  }

  if (action.type === "queue-review") {
    return state.reviewQueue.includes(action.word)
      ? state
      : { ...state, reviewQueue: [...state.reviewQueue, action.word] };
  }

  return state;
}
function practiceDates(state: LearningProgress, today: string, minutes: number) {
  const yesterday = dateKey(new Date(Date.now() - 86_400_000));
  const streakCount =
    state.lastPracticeDate === today
      ? state.streakCount
      : state.lastPracticeDate === yesterday
        ? state.streakCount + 1
        : 1;

  return {
    streakCount,
    lastPracticeDate: today,
    weeklyActivity: {
      ...state.weeklyActivity,
      [today]: (state.weeklyActivity[today] ?? 0) + minutes
    }
  };
}

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadProgress(): LearningProgress {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return defaultProgress;
    const parsed = JSON.parse(value) as Partial<LearningProgress>;
    if (parsed.schemaVersion !== 2) return defaultProgress;
    return {
      ...defaultProgress,
      ...parsed,
      profile: { ...defaultProfile, ...parsed.profile }
    };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: LearningProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
