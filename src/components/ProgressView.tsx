import { ArrowRight, BookOpen, Check, Clock3, Flame, Search, Volume2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { dateKey } from "../state/learningStore";
import { levelLabel, minutesLabel } from "../services/amharicUi";
import type { LearningProgress, ReadingLesson } from "../types/learning";

export function ProgressView({
  progress,
  readingLessons,
  sequence,
  onOpenWord
}: {
  progress: LearningProgress;
  readingLessons: ReadingLesson[];
  sequence: readonly string[];
  onOpenWord: (word: string) => void;
}) {
  const [query, setQuery] = useState("");
  const learnedPercent = (progress.learnedWords.length / 5000) * 100;
  const week = useMemo(() => getWeek(progress.weeklyActivity), [progress.weeklyActivity]);
  const maxMinutes = Math.max(15, ...week.map((day) => day.minutes));
  const resultWords = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sequence.slice(progress.learnedWords.length, progress.learnedWords.length + 10);
    return sequence.filter((word) => word.includes(term)).slice(0, 20);
  }, [progress.learnedWords.length, query, sequence]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (resultWords[0]) onOpenWord(resultWords[0]);
  }

  return (
    <div className="progress-view">
      <section className="page-heading"><div><h1>እድገትዎ</h1><p>የመናገር ቃላት፣ የንባብ ውጤቶች እና የዕለት ልምምድዎ በአንድ ቦታ።</p></div></section>
      <section className="progress-summary">
        <div><Volume2 size={21} /><span><small>የመናገር ቃላት</small><strong>{progress.learnedWords.length.toLocaleString()}</strong><em>ከ5,000</em></span></div>
        <div><BookOpen size={21} /><span><small>የተጠናቀቁ ንባቦች</small><strong>{progress.completedReadingIds.length}</strong><em>ከ{readingLessons.length}</em></span></div>
        <div><Flame size={21} /><span><small>ተከታታይ ልምምድ</small><strong>{progress.streakCount}</strong><em>ቀናት</em></span></div>
        <div><Clock3 size={21} /><span><small>የልምምድ ጊዜ</small><strong>{progress.totalSpeakingMinutes + progress.totalReadingMinutes}</strong><em>ደቂቃ</em></span></div>
      </section>

      <div className="progress-grid">
        <section className="fluency-progress">
          <div className="section-title-row"><div><p>የመናገር ብቃት</p><h2>5,000 ጠቃሚ የመናገር ቃላት</h2></div><strong>{learnedPercent.toFixed(1)}%</strong></div>
          <div className="large-meter"><i style={{ width: `${Math.max(0.5, learnedPercent)}%` }} /></div>
          <div className="milestones">
            {[100, 500, 1000, 2500, 5000].map((milestone) => <span key={milestone} className={progress.learnedWords.length >= milestone ? "complete" : ""}><i>{progress.learnedWords.length >= milestone ? <Check size={13} /> : null}</i><strong>{milestone.toLocaleString()}</strong><small>{milestone === 5000 ? "የብቃት ደረጃ" : "ቃላት"}</small></span>)}
          </div>
        </section>

        <section className="weekly-chart">
          <div className="section-title-row"><div><p>ያለፉት 7 ቀናት</p><h2>የልምምድ ደቂቃዎች</h2></div><span>{week.reduce((sum, day) => sum + day.minutes, 0)} ደቂቃ</span></div>
          <div className="bar-chart" aria-label="ያለፉት ሰባት ቀናት የልምምድ ደቂቃዎች">
            {week.map((day) => <div key={day.key}><span><i style={{ height: `${Math.max(3, (day.minutes / maxMinutes) * 100)}%` }} /></span><small>{day.label}</small><em>{day.minutes}</em></div>)}
          </div>
        </section>

        <section className="word-catalog">
          <div className="section-title-row"><div><p>የመናገር ቃላት ዝርዝር</p><h2>ማንኛውንም ቃል ይፈልጉ</h2></div><span>በአጠቃቀም ብዛት የተደረደረ</span></div>
          <form className="catalog-search" onSubmit={submit}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ከ5,000 ቃላት ይፈልጉ" /><button aria-label="የመጀመሪያውን ውጤት ክፈት"><ArrowRight size={18} /></button></form>
          <div className="catalog-results">
            {resultWords.map((word) => {
              const rank = sequence.indexOf(word) + 1;
              const learned = progress.learnedWords.includes(word);
              return <button key={word} onClick={() => onOpenWord(word)}><span>{learned ? <Check size={15} /> : rank}</span><strong>{word}</strong><small>{learned ? "ተምረዋል" : `ቃል ${rank}`}</small><ArrowRight size={16} /></button>;
            })}
          </div>
        </section>

        <section className="reading-progress-list">
          <div className="section-title-row"><div><p>የንባብ ግንዛቤ</p><h2>የትምህርት ውጤቶች</h2></div></div>
          {readingLessons.map((lesson) => {
            const score = progress.readingScores[lesson.id];
            return <div key={lesson.id}><span className={score === undefined ? "pending" : "done"}>{score === undefined ? levelLabel(lesson.level)[0] : <Check size={15} />}</span><div><strong>{lesson.title}</strong><small>{levelLabel(lesson.level)} · {minutesLabel(lesson.minutes)}</small></div><em>{score === undefined ? "አልተጀመረም" : `${score} / ${lesson.questions.length}`}</em></div>;
          })}
        </section>
      </div>
    </div>
  );
}

function getWeek(activity: Record<string, number>) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 86_400_000);
    const key = dateKey(date);
    return { key, label: new Intl.DateTimeFormat("am-ET", { weekday: "narrow" }).format(date), minutes: activity[key] ?? 0 };
  });
}
