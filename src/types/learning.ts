export type Level = "beginner" | "intermediate" | "advanced";

export type ViewId =
  | "today"
  | "speak"
  | "read"
  | "review"
  | "progress"
  | "settings";

export type SpeakingStep = "word" | "phrase" | "short" | "long";

export type VisualKey =
  | "coffee"
  | "water"
  | "work"
  | "home"
  | "bus"
  | "food"
  | "family"
  | "market"
  | "classroom"
  | "health"
  | "phone"
  | "city";

export type SpeakingLesson = {
  id: string;
  rank: number;
  word: string;
  ipa: string;
  amharic: string;
  transliteration: string;
  visual: VisualKey;
  phrase: string;
  shortSentence: string;
  longSentence: string;
  meaningAmharic: string;
  grammarAmharic: string;
  pronunciationTipAmharic: string;
  conversationPrompt: string;
  topic: string;
};
export type ReadingQuestion = {
  id: string;
  prompt: string;
  promptAmharic: string;
  choices: string[];
  answer: string;
  explanationAmharic: string;
};

export type ReadingLesson = {
  id: string;
  title: string;
  titleAmharic: string;
  level: Level;
  minutes: number;
  passage: string;
  amharicSupport: string;
  targetWords: Array<{ english: string; amharic: string }>;
  questions: ReadingQuestion[];
  visual: VisualKey;
};

export type LearnerProfile = {
  name: string;
  level: Level;
  dailyGoalMinutes: number;
  reminderTime: string;
  remindersEnabled: boolean;
  voiceRate: number;
  onboardingComplete: boolean;
};

export type LearningProgress = {
  schemaVersion: 2;
  profile: LearnerProfile;
  learnedWords: string[];
  mastery: Record<string, number>;
  reviewQueue: string[];
  completedReadingIds: string[];
  readingScores: Record<string, number>;
  totalSpeakingMinutes: number;
  totalReadingMinutes: number;
  streakCount: number;
  lastPracticeDate: string | null;
  weeklyActivity: Record<string, number>;
};
