import {
  ArrowRight,
  Check,
  CircleStop,
  Headphones,
  LoaderCircle,
  Mic2,
  RotateCcw,
  Search,
  Volume2
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { visualImages } from "../data/curriculum";
import { englishToAmharicPronunciation } from "../services/amharicPronunciation";
import { topicLabel } from "../services/amharicUi";
import { speakText } from "../services/edgeTts";
import {
  GeminiVoiceCoach,
  type VoiceStatus,
  type VoiceTurn
} from "../services/geminiVoice";
import type { LearnerProfile, SpeakingLesson, SpeakingStep } from "../types/learning";

const steps: Array<{ id: SpeakingStep; label: string; shortLabel: string }> = [
  { id: "word", label: "ቃል", shortLabel: "ቃል" },
  { id: "phrase", label: "ሐረግ", shortLabel: "ሐረግ" },
  { id: "short", label: "አጭር ዓረፍተ ነገር", shortLabel: "አጭር" },
  { id: "long", label: "ረጅም ዓረፍተ ነገር", shortLabel: "ረጅም" }
];

type LessonTab = "meaning" | "grammar" | "pronunciation";

export function SpeakView({
  lesson,
  profile,
  reviewWords,
  completed,
  loadingLesson,
  onComplete,
  onNextLesson,
  onFindWord
}: {
  lesson: SpeakingLesson;
  profile: LearnerProfile;
  reviewWords: string[];
  completed: boolean;
  loadingLesson: boolean;
  onComplete: (lesson: SpeakingLesson) => void;
  onNextLesson: () => void;
  onFindWord: (word: string) => void;
}) {
  const [step, setStep] = useState<SpeakingStep>("word");
  const [furthestStep, setFurthestStep] = useState(0);
  const [tab, setTab] = useState<LessonTab>("meaning");
  const [search, setSearch] = useState("");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [voiceMessage, setVoiceMessage] = useState("ለአጭር ውይይት ዝግጁ ነው።");
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [turns, setTurns] = useState<VoiceTurn[]>([]);
  const [liveTurn, setLiveTurn] = useState<VoiceTurn | null>(null);
  const coachRef = useRef<GeminiVoiceCoach | null>(null);
  const readerRef = useRef<HTMLDivElement | null>(null);
  const currentIndex = steps.findIndex((item) => item.id === step);
  const currentText = getStepText(lesson, step);
  const targetPronunciation = englishToAmharicPronunciation(currentText);
  const isVoiceActive = ["connecting", "listening", "thinking", "speaking"].includes(voiceStatus);
  const learnerTurnCount = turns.filter((turn) => turn.speaker === "learner").length;
  const voicePhase = learnerTurnCount === 0 ? 0 : learnerTurnCount === 1 ? 1 : learnerTurnCount === 2 ? 2 : 3;

  useEffect(() => {
    setStep("word");
    setFurthestStep(0);
  }, [lesson.id]);

  useEffect(() => {
    setTurns([]);
    setLiveTurn(null);
    coachRef.current?.stop();
    coachRef.current = null;
  }, [lesson.id, step]);

  useEffect(() => {
    const reader = readerRef.current;
    if (!reader) return;
    reader.scrollTo({ top: reader.scrollHeight, behavior: "smooth" });
  }, [turns, liveTurn?.text]);

  useEffect(() => () => coachRef.current?.stop(), []);

  const bars = useMemo(
    () => Array.from({ length: 34 }, (_, index) => 8 + ((index * 17) % 24)),
    []
  );

  function selectStep(nextStep: SpeakingStep, index: number) {
    if (index > furthestStep + 1) return;
    setStep(nextStep);
    setFurthestStep((value) => Math.max(value, index));
  }

  function continueLesson() {
    if (currentIndex < steps.length - 1) {
      const nextIndex = currentIndex + 1;
      setStep(steps[nextIndex].id);
      setFurthestStep((value) => Math.max(value, nextIndex));
      return;
    }
    if (!completed) onComplete(lesson);
    else onNextLesson();
  }

  async function toggleVoice() {
    if (isVoiceActive) {
      coachRef.current?.stop();
      coachRef.current = null;
      return;
    }

    const coach = new GeminiVoiceCoach({
      onStatus: (status, message) => {
        setVoiceStatus(status);
        setVoiceMessage(message);
      },
      onTurn: (turn) => setTurns((existing) => [...existing, turn]),
      onTranscript: setLiveTurn,
      onLevel: setVoiceLevel
    });
    coachRef.current = coach;
    try {
      await coach.start({
        learnerName: profile.name,
        learnerLevel: profile.level,
        lesson,
        step,
        reviewWords
      });
    } catch (error) {
      if (coachRef.current !== coach) return;
      setVoiceStatus("error");
      setVoiceMessage(error instanceof Error ? error.message : "የድምፅ ልምምዱን መጀመር አልተቻለም።");
      coach.stop();
      coachRef.current = null;
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (!search.trim()) return;
    onFindWord(search.trim().toLowerCase());
    setSearch("");
  }

  return (
    <div className="speak-view">
      <section className="page-heading compact-heading">
        <div><h1>የመናገር ትምህርት</h1><p>ቃሉን ይማሩ፣ ያዳምጡ፣ ይናገሩ እና በውይይት ይጠቀሙበት።</p></div>
        <form className="word-search" onSubmit={submitSearch}>
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ከ5,000 ቃላት ውስጥ ይፈልጉ" aria-label="ከመናገር ትምህርቱ ቃል ይፈልጉ" />
          <button aria-label="ቃል ፈልግ" disabled={loadingLesson}>{loadingLesson ? <LoaderCircle className="spin" size={18} /> : <ArrowRight size={18} />}</button>
        </form>
      </section>

      <div className="speaking-layout">
        <section className="vocabulary-panel">
          <div className="vocabulary-image"><img src={visualImages[lesson.visual]} alt={`የ${lesson.word} ምስላዊ ማብራሪያ`} /><span>{topicLabel(lesson.topic)}</span></div>
          <div className="vocabulary-copy">
            <p>ከ5,000 ቃላት ውስጥ ቃል {lesson.rank}</p>
            <h2>{lesson.word}</h2>
            <div className="ipa-row"><span>{lesson.ipa || "አነጋገሩን ያዳምጡ"}</span><button className="icon-text-button" onClick={() => speakText(lesson.word, profile.voiceRate)}><Volume2 size={19} /> ቀስ ብሎ</button></div>
            <strong lang="am">{lesson.amharic}</strong>
            <small>{lesson.transliteration}</small>
          </div>
        </section>

        <section className="lesson-steps" aria-label="የመናገር ትምህርት ደረጃዎች">
          {steps.map((item, index) => {
            const unlocked = completed || index <= furthestStep + 1;
            const passed = index < currentIndex || completed;
            return (
              <button key={item.id} className={step === item.id ? "active" : passed ? "passed" : ""} disabled={!unlocked} onClick={() => selectStep(item.id, index)}>
                <i>{passed ? <Check size={14} /> : index + 1}</i><span><strong>{item.label}</strong><small>{getStepText(lesson, item.id)}</small></span>
              </button>
            );
          })}
        </section>

        <section className="practice-panel" aria-labelledby="practice-heading">
          <div className="practice-header">
            <div><p>ይረዱና ይጠቀሙ</p><h2 id="practice-heading">{currentText}</h2></div>
            <button className="replay-button" onClick={() => speakText(currentText, profile.voiceRate)}><Volume2 size={20} /><span>ቀስ ብሎ አጫውት</span></button>
          </div>

          <div className={`voice-coach ${voiceStatus}`}>
            <div className="coach-title"><span><Headphones size={20} /></span><div><strong>ጄሚኒ የድምፅ አሰልጣኝ</strong><small>{voiceMessage}</small></div><i className="connection-dot" /></div>
            <ol className="conversation-stages" aria-label="የድምፅ ትምህርት ቅደም ተከተል">
              {["ይረዱ", "ያስተውሉ", "ይመልሱ", "ይወያዩ"].map((label, index) => (
                <li key={label} className={index === voicePhase ? "active" : index < voicePhase ? "done" : ""}>
                  <span>{index < voicePhase ? <Check size={12} /> : index + 1}</span>{label}
                </li>
              ))}
            </ol>
            <div className="voice-reader" ref={readerRef} aria-live="polite" aria-label="ቀጥታ የድምፅ ጽሑፍ">
              <div className="voice-target-line">
                <span>አሁን የሚለማመዱት</span>
                <strong lang="en">{currentText}</strong>
                <small lang="am">{targetPronunciation}</small>
              </div>
              {turns.slice(-8).map((turn) => <TranscriptLine key={turn.id} turn={turn} active={false} />)}
              {liveTurn ? <TranscriptLine key={liveTurn.id} turn={liveTurn} active /> : null}
            </div>
            <div className="waveform" aria-hidden="true">
              {bars.map((height, index) => <i key={index} style={{ height: `${Math.max(height * (voiceLevel || 0.32), 3)}px` }} />)}
            </div>
            <div className="voice-actions">
              <button className={`voice-button ${isVoiceActive ? "stop" : ""}`} onClick={toggleVoice}>
                {voiceStatus === "connecting" ? <LoaderCircle className="spin" size={22} /> : isVoiceActive ? <CircleStop size={22} /> : <Mic2 size={22} />}
                {voiceStatus === "connecting" ? "ግንኙነቱን ሰርዝ" : isVoiceActive ? "ልምምዱን ጨርስ" : "ከጄሚኒ ጋር ይናገሩ"}
              </button>
              <button className="square-icon-button" onClick={() => speakText(currentText, 1)} aria-label="በመደበኛ ፍጥነት እንደገና አጫውት" title="በመደበኛ ፍጥነት እንደገና አጫውት"><RotateCcw size={20} /></button>
            </div>
          </div>

          <button className="primary-button continue-button" onClick={continueLesson}>
            {currentIndex < 3 ? "ቀጥል" : completed ? "ቀጣይ ቃል" : "ትምህርቱን ጨርስ"}<ArrowRight size={18} />
          </button>
        </section>

        <aside className="lesson-notes">
          <div className="note-tabs" role="tablist" aria-label="የትምህርት ማብራሪያ">
            {(["meaning", "grammar", "pronunciation"] as LessonTab[]).map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item === "meaning" ? "ትርጉም" : item === "grammar" ? "ሰዋሰው" : "አነጋገር"}</button>)}
          </div>
          <div className="note-content" lang="am">
            <h2>{tab === "meaning" ? "ትርጉም" : tab === "grammar" ? "ሰዋሰው" : "አነጋገር"}</h2>
            <p>{tab === "meaning" ? lesson.meaningAmharic : tab === "grammar" ? lesson.grammarAmharic : lesson.pronunciationTipAmharic}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function getStepText(lesson: SpeakingLesson, step: SpeakingStep) {
  if (step === "word") return lesson.word;
  if (step === "phrase") return lesson.phrase;
  if (step === "short") return lesson.shortSentence;
  return lesson.longSentence;
}

function TranscriptLine({ turn, active }: { turn: VoiceTurn; active: boolean }) {
  const pronunciation = englishToAmharicPronunciation(turn.text);
  return (
    <article className={`voice-reader-line ${turn.speaker} ${active ? "active" : ""}`}>
      <span>{turn.speaker === "coach" ? "አሰልጣኝ" : "እርስዎ"}</span>
      <p lang={/[A-Za-z]/.test(turn.text) ? "en" : "am"}>
        <HighlightedWords text={turn.text} active={active} />
      </p>
      {pronunciation ? <small lang="am">{pronunciation}</small> : null}
    </article>
  );
}

function HighlightedWords({ text, active }: { text: string; active: boolean }) {
  const tokens = text.split(/(\s+)/);
  let currentIndex = -1;
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    if (/\S/.test(tokens[index])) {
      currentIndex = index;
      break;
    }
  }
  return tokens.map((token, index) => (
    <span key={`${index}-${token}`} className={active && index === currentIndex ? "current-word" : undefined}>
      {token}
    </span>
  ));
}
