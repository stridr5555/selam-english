import { ArrowRight, Check, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { speakingLessons } from "../data/curriculum";
import { speakText } from "../services/edgeTts";
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
        <h1>ክለሳው ተጠናቋል</h1>
        <p lang="am">ዛሬ ለመከለስ የቀረ ቃል የለም። አዲስ የመናገር ትምህርት ይጀምሩ።</p>
        <button className="primary-button" onClick={() => onOpenSpeaking("coffee")}>የመናገር ትምህርት ይጀምሩ <ArrowRight size={18} /></button>
      </div>
    );
  }

  return (
    <div className="review-view">
      <section className="page-heading compact-heading">
        <div><h1>ፈጣን ክለሳ</h1><p>የተማሩትን ቃላት በአጭር ጊዜ ይድገሙ። ከባድ ቃላት ብዙ ጊዜ ይመለሳሉ።</p></div>
        <div className="review-count"><RotateCcw size={18} /><strong>{index + 1}</strong><span>ከ{queue.length}</span></div>
      </section>
      <section className={`review-card ${revealed ? "revealed" : ""}`}>
        <div className="review-card-top"><span>ብቃት {mastery[word] ?? 0} / 5</span><button onClick={() => speakText(word, voiceRate)} aria-label={`${word}ን ያዳምጡ`}><Volume2 size={20} /></button></div>
        <button className="review-flashcard" onClick={() => setRevealed(true)}>
          <span>ይህን ቃል ጮክ ብለው ይናገሩ</span>
          <h2>{word}</h2>
          {revealed ? <div><strong lang="am">{lesson?.amharic ?? "ትርጉሙን በትምህርቱ ይመልከቱ"}</strong><p>{lesson?.shortSentence ?? `Use “${word}” in one short sentence.`}</p></div> : <small>መልሱን ለማየት ይንኩ</small>}
        </button>
        {revealed ? (
          <div className="rating-row">
            <p>ምን ያህል አስታወሱት?</p>
            <div><button onClick={() => rate(1)}>እንደገና<small>ደግሜ ልማር</small></button><button onClick={() => rate(3)}>ትንሽ ቀርቶኛል<small>ወደ ማወቅ ቀርቤያለሁ</small></button><button onClick={() => rate(5)}>አውቄዋለሁ<small>በደንብ አስታውሰዋለሁ</small></button></div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
