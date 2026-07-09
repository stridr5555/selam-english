import { ArrowRight, Check, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { speakingLessons } from "../data/curriculum";
import { speakText } from "../services/geminiVoice";
import { getCachedLessonForReview } from "../services/lessonGenerator";
import type { Level } from "../types/learning";

export function ReviewView({
  queue,
  mastery,
  voiceRate,
  level,
  onRate,
  onOpenSpeaking
}: {
  queue: string[];
  mastery: Record<string, number>;
  voiceRate: number;
  level: Level;
  onRate: (word: string, rating: number) => void;
  onOpenSpeaking: (word: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const word = queue[index];
  const lesson = speakingLessons.find((item) => item.word === word)
    ?? (word ? getCachedLessonForReview(word, level) : null);

  useEffect(() => {
    if (index >= queue.length) setIndex(Math.max(0, queue.length - 1));
    setRevealed(false);
  }, [queue.length, index]);

  function rate(value: number) {
    if (!word) return;
    onRate(word, value);
    setRevealed(false);
    if (index < queue.length - 1) setIndex((current) => current + 1);
  }

  if (!word) {
    return (
      <div className="empty-state">
        <span><Check size={30} /></span>
        <h1>Review complete</h1>
        <p lang="am">ዛሬ ለመከለስ የቀረ ቃል የለም። አዲስ የመናገር ትምህርት ይጀምሩ።</p>
        <button className="primary-button" onClick={() => onOpenSpeaking("coffee")}>Start a speaking lesson <ArrowRight size={18} /></button>
      </div>
    );
  }

  return (
    <div className="review-view">
      <section className="page-heading compact-heading">
        <div><h1>Quick review</h1><p>የተማሩትን ቃላት በአጭር ጊዜ ይድገሙ። ከባድ ቃላት ብዙ ጊዜ ይመለሳሉ።</p></div>
        <div className="review-count"><RotateCcw size={18} /><strong>{index + 1}</strong><span>of {queue.length}</span></div>
      </section>
      <section className={`review-card ${revealed ? "revealed" : ""}`}>
        <div className="review-card-top"><span>Mastery {mastery[word] ?? 0} / 5</span><button onClick={() => speakText(word, voiceRate)} aria-label={`Listen to ${word}`}><Volume2 size={20} /></button></div>
        <button className="review-flashcard" onClick={() => setRevealed(true)}>
          <span>Say this word aloud</span>
          <h2>{word}</h2>
          {revealed ? <div><strong lang="am">{lesson?.amharic ?? "ትርጉሙን በትምህርቱ ይመልከቱ"}</strong><p>{lesson?.shortSentence ?? `Use “${word}” in one short sentence.`}</p></div> : <small>Tap to show the answer</small>}
        </button>
        {revealed ? (
          <div className="rating-row">
            <p>How well did you remember it?</p>
            <div><button onClick={() => rate(1)}>Again<small>እንደገና</small></button><button onClick={() => rate(3)}>Almost<small>ትንሽ ቀርቶኛል</small></button><button onClick={() => rate(5)}>Got it<small>አውቄዋለሁ</small></button></div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
