import { Check, CircleAlert, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { Onboarding } from "./components/Onboarding";
import { ProgressView } from "./components/ProgressView";
import { ReadView } from "./components/ReadView";
import { ReviewView } from "./components/ReviewView";
import { SettingsView } from "./components/SettingsView";
import { SpeakView } from "./components/SpeakView";
import { TodayView } from "./components/TodayView";
import { readingLessons, speakingLessons } from "./data/curriculum";
import { spokenWordList } from "./data/spokenWords";
import { useLearningProgress } from "./hooks/useLearningProgress";
import { getGeneratedLesson } from "./services/lessonGenerator";
import {
  cancelPracticeReminder,
  schedulePracticeReminder
} from "./services/notifications";
import type { ReadingLesson, SpeakingLesson, ViewId } from "./types/learning";

const starterWords = speakingLessons.map((lesson) => lesson.word);
const starterWordSet = new Set(starterWords);
export const learningSequence = [
  ...starterWords,
  ...spokenWordList.filter((word) => !starterWordSet.has(word))
].slice(0, 5000);
const curriculumWordSet = new Set(learningSequence);

type ToastState = { type: "success" | "error"; message: string } | null;

export function App() {
  const { progress, dispatch } = useLearningProgress();
  const [view, setView] = useState<ViewId>(() => viewFromHash());
  const [lesson, setLesson] = useState<SpeakingLesson>(() => getStartingLesson(progress.learnedWords.length));
  const [reading, setReading] = useState<ReadingLesson>(() => getStartingReading(progress.completedReadingIds));
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [reminderMessage, setReminderMessage] = useState(
    progress.profile.remindersEnabled
      ? `Daily reminder set for ${progress.profile.reminderTime}.`
      : "No reminder is set."
  );
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const handleHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const reviewWords = useMemo(
    () => progress.reviewQueue.slice().sort(
      (left, right) => (progress.mastery[left] ?? 0) - (progress.mastery[right] ?? 0)
    ),
    [progress.mastery, progress.reviewQueue]
  );

  function navigate(nextView: ViewId) {
    setView(nextView);
    window.history.pushState(null, "", `#${nextView}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function openWord(word: string) {
    if (!curriculumWordSet.has(word)) {
      setToast({ type: "error", message: `“${word}” is not in the 5,000-word speaking catalog.` });
      return;
    }
    const curated = speakingLessons.find((item) => item.word === word);
    if (curated) {
      setLesson(curated);
      navigate("speak");
      return;
    }

    setLoadingLesson(true);
    navigate("speak");
    const rank = learningSequence.indexOf(word) + 1;
    const generated = await getGeneratedLesson(word, rank, progress.profile.level);
    setLesson(generated);
    setLoadingLesson(false);
  }

  async function openNextLesson() {
    const currentRank = learningSequence.indexOf(lesson.word);
    const nextIndex = currentRank >= 0
      ? Math.min(currentRank + 1, learningSequence.length - 1)
      : Math.min(progress.learnedWords.length, learningSequence.length - 1);
    await openWord(learningSequence[nextIndex]);
  }

  function completeSpeaking(completedLesson: SpeakingLesson) {
    dispatch({ type: "complete-speaking", word: completedLesson.word, minutes: 5 });
    setToast({ type: "success", message: `${completedLesson.word} added to your review queue.` });
  }

  function completeReading(completedLesson: ReadingLesson, score: number) {
    dispatch({ type: "complete-reading", lessonId: completedLesson.id, score, minutes: completedLesson.minutes });
    setToast({ type: "success", message: `Reading saved: ${score} of ${completedLesson.questions.length} correct.` });
  }

  async function enableReminder(time: string) {
    const result = await schedulePracticeReminder(time);
    setReminderMessage(result.message);
    if (result.ok) {
      dispatch({ type: "update-profile", updates: { reminderTime: time, remindersEnabled: true } });
      setToast({ type: "success", message: result.message });
    } else {
      setToast({ type: "error", message: result.message });
    }
  }

  async function disableReminder() {
    await cancelPracticeReminder();
    dispatch({ type: "update-profile", updates: { remindersEnabled: false } });
    setReminderMessage("Daily reminder is off.");
    setToast({ type: "success", message: "Daily reminder turned off." });
  }

  if (!progress.profile.onboardingComplete) {
    return (
      <Onboarding
        onComplete={(name, level, goal) => dispatch({ type: "complete-onboarding", name, level, goal })}
      />
    );
  }

  return (
    <AppShell progress={progress} view={view} onNavigate={navigate}>
      {view === "today" ? (
        <TodayView progress={progress} lesson={lesson} reading={reading} onNavigate={navigate} />
      ) : null}
      {view === "speak" ? (
        <SpeakView
          lesson={lesson}
          profile={progress.profile}
          reviewWords={reviewWords}
          completed={progress.learnedWords.includes(lesson.word)}
          loadingLesson={loadingLesson}
          onComplete={completeSpeaking}
          onNextLesson={openNextLesson}
          onFindWord={openWord}
        />
      ) : null}
      {view === "read" ? (
        <ReadView
          lessons={readingLessons}
          activeLesson={reading}
          completedIds={progress.completedReadingIds}
          voiceRate={progress.profile.voiceRate}
          onSelect={setReading}
          onComplete={completeReading}
        />
      ) : null}
      {view === "review" ? (
        <ReviewView
          queue={reviewWords}
          mastery={progress.mastery}
          voiceRate={progress.profile.voiceRate}
          onRate={(word, rating) => dispatch({ type: "rate-word", word, rating })}
          onOpenSpeaking={openWord}
        />
      ) : null}
      {view === "progress" ? (
        <ProgressView
          progress={progress}
          readingLessons={readingLessons}
          sequence={learningSequence}
          onOpenWord={openWord}
        />
      ) : null}
      {view === "settings" ? (
        <SettingsView
          profile={progress.profile}
          reminderMessage={reminderMessage}
          onSave={(updates) => {
            dispatch({ type: "update-profile", updates });
            setToast({ type: "success", message: "Settings saved." });
          }}
          onSetReminder={enableReminder}
          onDisableReminder={disableReminder}
          onReset={() => {
            dispatch({ type: "reset" });
            setLesson(speakingLessons[0]);
            setReading(readingLessons[0]);
          }}
        />
      ) : null}
      {toast ? <Toast toast={toast} onClose={() => setToast(null)} /> : null}
    </AppShell>
  );
}

function Toast({ toast, onClose }: { toast: NonNullable<ToastState>; onClose: () => void }) {
  return (
    <div className={`toast ${toast.type}`} role="status">
      {toast.type === "success" ? <Check size={19} /> : <CircleAlert size={19} />}
      <span>{toast.message}</span>
      <button onClick={onClose} aria-label="Close message"><X size={17} /></button>
    </div>
  );
}

function viewFromHash(): ViewId {
  const value = window.location.hash.replace("#", "") as ViewId;
  return ["today", "speak", "read", "review", "progress", "settings"].includes(value)
    ? value
    : "today";
}

function getStartingLesson(learnedCount: number) {
  return speakingLessons[Math.min(learnedCount, speakingLessons.length - 1)] ?? speakingLessons[0];
}

function getStartingReading(completedIds: string[]) {
  return readingLessons.find((lesson) => !completedIds.includes(lesson.id)) ?? readingLessons[0];
}
