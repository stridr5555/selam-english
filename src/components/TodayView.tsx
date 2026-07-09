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
import { minutesLabel, topicLabel } from "../services/amharicUi";
import type { LearningProgress, ReadingLesson, SpeakingLesson, ViewId } from "../types/learning";
import { speakText } from "../services/edgeTts";

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
          <h1>የዛሬ እቅድ</h1>
          <p>ዛሬ በትንሽ ጊዜ መናገርን፣ ማንበብን እና ክለሳን ይለማመዱ።</p>
        </div>
        <div className="daily-goal">
          <span>ከ3 ውስጥ {doneCount} ተጠናቋል</span>
          <div className="meter"><i style={{ width: `${(doneCount / 3) * 100}%` }} /></div>
        </div>
      </section>

      <div className="today-grid">
        <aside className="plan-rail" aria-label="የዛሬ ተግባራት">
          <h2>የዕለት እቅድ</h2>
          <PlanItem icon={Mic2} title="የመናገር ትምህርት" meta="6 ደቂቃ" done={speakingDone} active={!speakingDone} onClick={() => onNavigate("speak")} />
          <PlanItem icon={BookOpen} title="ንባብ" meta={minutesLabel(reading.minutes)} done={readingDone} active={speakingDone && !readingDone} onClick={() => onNavigate("read")} />
          <PlanItem icon={RotateCcw} title="ፈጣን ክለሳ" meta={`${Math.max(1, progress.reviewQueue.length)} ቃላት`} done={reviewDone} active={speakingDone && readingDone} onClick={() => onNavigate("review")} />
          <div className="goal-note"><Clock3 size={18} /><span><strong>የ{progress.profile.dailyGoalMinutes} ደቂቃ ግብ</strong><small>አጭር ልምምድም ይቆጠራል።</small></span></div>
        </aside>

        <section className="daily-lesson" aria-labelledby="daily-word">
          <div className="section-title-row">
            <div><p>የመናገር ትምህርት · {topicLabel(lesson.topic)}</p><h2 id="daily-word">አንድ ጠቃሚ ቃል ይማሩ</h2></div>
            <span className="rank-label">ከ5,000 ቃላት ውስጥ {lesson.rank}</span>
          </div>
          <div className="lesson-preview">
            <img src={visualImages[lesson.visual]} alt={`የ${lesson.word} ምስላዊ ማብራሪያ`} />
            <div className="preview-word">
              <p>የዛሬ ቃል</p>
              <h3>{lesson.word}</h3>
              <div className="pronunciation-line"><span>{lesson.ipa}</span><button className="icon-text-button" onClick={() => speakText(lesson.word, progress.profile.voiceRate)}><Volume2 size={18} /> ቀስ ብሎ</button></div>
              <strong lang="am">{lesson.amharic}</strong>
              <small>{lesson.transliteration}</small>
            </div>
          </div>
          <div className="progression-strip" aria-label="የትምህርት እድገት">
            {["ቃል", "ሐረግ", "አጭር ዓረፍተ ነገር", "ረጅም ዓረፍተ ነገር"].map((item, index) => (
              <span key={item} className={index === 0 ? "active" : ""}><i>{index + 1}</i>{item}</span>
            ))}
          </div>
          <div className="lesson-cta">
            <span><Headphones size={20} /> ያዳምጡ፣ ይድገሙ፣ ከዚያም ቃሉን ከጄሚኒ ጋር ይጠቀሙ።</span>
            <button className="primary-button" onClick={() => onNavigate("speak")}>{speakingDone ? "እንደገና ይለማመዱ" : "መናገር ይጀምሩ"}<ArrowRight size={18} /></button>
          </div>
        </section>
      </div>

      <section className="reading-preview-band">
        <img src={visualImages[reading.visual]} alt="የንባብ ትምህርት ሁኔታ" />
        <div><p>የንባብ ግንዛቤ · {minutesLabel(reading.minutes)}</p><h2>{reading.title}</h2><span lang="am">{reading.titleAmharic}</span></div>
        <button className="secondary-button" onClick={() => onNavigate("read")}>ንባቡን ክፈት <ArrowRight size={18} /></button>
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
      <span><strong>{title}</strong><small>{done ? "ተጠናቋል" : meta}</small></span>
      <ArrowRight size={17} />
    </button>
  );
}
