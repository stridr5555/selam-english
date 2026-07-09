import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Headphones,
  Mic2,
  RotateCcw,
  Volume2
} from "lucide-react";
import { visualImages } from "../data/curriculum";
import type { LearningProgress, ReadingLesson, SpeakingLesson, ViewId } from "../types/learning";
import { speakText } from "../services/geminiVoice";

export function TodayView({
  progress,
  lesson,
  reading,
  onNavigate
}: {
  progress: LearningProgress;
  lesson: SpeakingLesson;
  reading: ReadingLesson;
  onNavigate: (view: ViewId) => void;
}) {
  const speakingDone = progress.learnedWords.includes(lesson.word);
  const readingDone = progress.completedReadingIds.includes(reading.id);
  const reviewDone = progress.reviewQueue.length === 0;
  const doneCount = [speakingDone, readingDone, reviewDone].filter(Boolean).length;

  return (
    <div className="today-view">
      <section className="page-heading">
        <div>
          <h1>Today’s plan</h1>
          <p>ዛሬ በትንሽ ጊዜ መናገርን፣ ማንበብን እና ክለሳን ይለማመዱ።</p>
        </div>
        <div className="daily-goal">
          <span>{doneCount} of 3 complete</span>
          <div className="meter"><i style={{ width: `${(doneCount / 3) * 100}%` }} /></div>
        </div>
      </section>

      <div className="today-grid">
        <aside className="plan-rail" aria-label="Today's activities">
          <h2>Daily plan</h2>
          <PlanItem icon={Mic2} title="Speaking lesson" meta="6 min" done={speakingDone} active={!speakingDone} onClick={() => onNavigate("speak")} />
          <PlanItem icon={BookOpen} title="Reading" meta={`${reading.minutes} min`} done={readingDone} active={speakingDone && !readingDone} onClick={() => onNavigate("read")} />
          <PlanItem icon={RotateCcw} title="Quick review" meta={`${Math.max(1, progress.reviewQueue.length)} words`} done={reviewDone} active={speakingDone && readingDone} onClick={() => onNavigate("review")} />
          <div className="goal-note"><Clock3 size={18} /><span><strong>{progress.profile.dailyGoalMinutes} minute goal</strong><small>Short practice counts.</small></span></div>
        </aside>

        <section className="daily-lesson" aria-labelledby="daily-word">
          <div className="section-title-row">
            <div><p>Speaking lesson · {lesson.topic}</p><h2 id="daily-word">Learn one useful word</h2></div>
            <span className="rank-label">Word {lesson.rank} of 5,000</span>
          </div>
          <div className="lesson-preview">
            <img src={visualImages[lesson.visual]} alt={`Visual context for ${lesson.word}`} />
            <div className="preview-word">
              <p>Today’s word</p>
              <h3>{lesson.word}</h3>
              <div className="pronunciation-line"><span>{lesson.ipa}</span><button className="icon-text-button" onClick={() => speakText(lesson.word, progress.profile.voiceRate)}><Volume2 size={18} /> Slow</button></div>
              <strong lang="am">{lesson.amharic}</strong>
              <small>{lesson.transliteration}</small>
            </div>
          </div>
          <div className="progression-strip" aria-label="Lesson progression">
            {["Word", "Phrase", "Short sentence", "Long sentence"].map((item, index) => (
              <span key={item} className={index === 0 ? "active" : ""}><i>{index + 1}</i>{item}</span>
            ))}
          </div>
          <div className="lesson-cta">
            <span><Headphones size={20} /> Listen, repeat, then use the word with Gemini.</span>
            <button className="primary-button" onClick={() => onNavigate("speak")}>{speakingDone ? "Practice again" : "Start speaking"}<ArrowRight size={18} /></button>
          </div>
        </section>
      </div>

      <section className="reading-preview-band">
        <img src={visualImages[reading.visual]} alt="Reading lesson setting" />
        <div><p>Reading comprehension · {reading.minutes} min</p><h2>{reading.title}</h2><span lang="am">{reading.titleAmharic}</span></div>
        <button className="secondary-button" onClick={() => onNavigate("read")}>Open reading <ArrowRight size={18} /></button>
      </section>
    </div>
  );
}
function PlanItem({
  icon: Icon,
  title,
  meta,
  done,
  active,
  onClick
}: {
  icon: typeof Mic2;
  title: string;
  meta: string;
  done: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`plan-item ${active ? "active" : ""}`} onClick={onClick}>
      <span className="plan-icon">{done ? <Check size={18} /> : <Icon size={19} />}</span>
      <span><strong>{title}</strong><small>{done ? "Complete" : meta}</small></span>
      <ArrowRight size={17} />
    </button>
  );
}
