import { ArrowLeft, ArrowRight, BookOpen, Check, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { visualImages } from "../data/curriculum";
import { speakText } from "../services/geminiVoice";
import type { ReadingLesson } from "../types/learning";

export function ReadView({
  lessons,
  activeLesson,
  completedIds,
  voiceRate,
  onSelect,
  onComplete
}: {
  lessons: ReadingLesson[];
  activeLesson: ReadingLesson;
  completedIds: string[];
  voiceRate: number;
  onSelect: (lesson: ReadingLesson) => void;
  onComplete: (lesson: ReadingLesson, score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showSupport, setShowSupport] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const allAnswered = activeLesson.questions.every((question) => answers[question.id]);
  const score = useMemo(
    () => activeLesson.questions.filter((question) => answers[question.id] === question.answer).length,
    [activeLesson.questions, answers]
  );

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setShowSupport(true);
  }, [activeLesson.id]);

  function submit() {
    if (!allAnswered) return;
    setSubmitted(true);
    onComplete(activeLesson, score);
  }

  const lessonIndex = lessons.findIndex((lesson) => lesson.id === activeLesson.id);

  return (
    <div className="read-view">
      <section className="page-heading compact-heading">
        <div><h1>Reading comprehension</h1><p>በአማርኛ እገዛ ያንብቡ፣ ዋናውን ሐሳብ ይረዱ እና ጥያቄዎችን ይመልሱ።</p></div>
        <div className="level-indicator"><BookOpen size={18} /><span><strong>{activeLesson.level}</strong><small>{activeLesson.minutes} minute lesson</small></span></div>
      </section>

      <div className="reading-workspace">
        <aside className="reading-library" aria-label="Reading lessons">
          <h2>Reading path</h2>
          {lessons.map((lesson) => (
            <button key={lesson.id} className={lesson.id === activeLesson.id ? "active" : ""} onClick={() => onSelect(lesson)}>
              <span>{completedIds.includes(lesson.id) ? <Check size={15} /> : lesson.level[0].toUpperCase()}</span>
              <div><strong>{lesson.title}</strong><small>{lesson.titleAmharic}</small></div>
            </button>
          ))}
        </aside>

        <div className="reading-content">
          <article className="passage-panel">
            <img src={visualImages[activeLesson.visual]} alt={activeLesson.title} />
            <div className="passage-heading"><div><p>{activeLesson.level} · {activeLesson.minutes} min</p><h2>{activeLesson.title}</h2><span lang="am">{activeLesson.titleAmharic}</span></div><button className="icon-text-button" onClick={() => speakText(activeLesson.passage, voiceRate)}><Volume2 size={19} /> Read aloud</button></div>
            <p className="passage-text">{activeLesson.passage}</p>
          </article>

          <section className="reading-support">
            <div className="support-heading"><div><h2 lang="am">የንባብ እገዛ</h2><p>Amharic explanation</p></div><button onClick={() => setShowSupport((value) => !value)}>{showSupport ? "Hide" : "Show"}</button></div>
            {showSupport ? <p lang="am">{activeLesson.amharicSupport}</p> : null}
            <dl className="glossary">
              {activeLesson.targetWords.map((word) => <div key={word.english}><dt>{word.english}</dt><dd lang="am">{word.amharic}</dd></div>)}
            </dl>
          </section>

          <section className="quiz-panel">
            <div className="section-title-row"><div><p>Check your understanding</p><h2>Questions</h2></div><span>{Object.keys(answers).length} / {activeLesson.questions.length} answered</span></div>
            {activeLesson.questions.map((question, index) => (
              <fieldset className="reading-question" key={question.id}>
                <legend><span>{index + 1}</span><strong>{question.prompt}</strong><small lang="am">{question.promptAmharic}</small></legend>
                <div>
                  {question.choices.map((choice) => {
                    const selected = answers[question.id] === choice;
                    const correct = submitted && choice === question.answer;
                    const wrong = submitted && selected && choice !== question.answer;
                    return <button type="button" key={choice} className={correct ? "correct" : wrong ? "wrong" : selected ? "selected" : ""} onClick={() => !submitted && setAnswers((current) => ({ ...current, [question.id]: choice }))}><i>{correct ? <Check size={15} /> : String.fromCharCode(65 + question.choices.indexOf(choice))}</i>{choice}</button>;
                  })}
                </div>
                {submitted ? <p className="answer-explanation" lang="am">{question.explanationAmharic}</p> : null}
              </fieldset>
            ))}
            {submitted ? (
              <div className="quiz-result"><span><strong>{score} / {activeLesson.questions.length}</strong> correct</span><p lang="am">{score === activeLesson.questions.length ? "በጣም ጥሩ። ዋናውን ሐሳብ በትክክል ተረድተዋል።" : "መልሶቹን ይመልከቱና ንባቡን አንድ ጊዜ ደግመው ያንብቡ።"}</p></div>
            ) : null}
            <div className="quiz-footer">
              <button className="secondary-button" disabled={lessonIndex === 0} onClick={() => onSelect(lessons[lessonIndex - 1])}><ArrowLeft size={18} /> Previous</button>
              {!submitted ? <button className="primary-button" disabled={!allAnswered} onClick={submit}>Check answers <Check size={18} /></button> : <button className="primary-button" disabled={lessonIndex === lessons.length - 1} onClick={() => onSelect(lessons[lessonIndex + 1])}>Next reading <ArrowRight size={18} /></button>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
