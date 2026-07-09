import { ArrowRight, BookOpen, Mic2, Volume2 } from "lucide-react";
import { useState } from "react";
import type { Level } from "../types/learning";

export function Onboarding({
  onComplete
}: {
  onComplete: (name: string, level: Level, goal: number) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [goal, setGoal] = useState(15);

  return (
    <div className="onboarding-page">
      <div className="onboarding-brand"><span><Volume2 size={22} /></span> ሰላም እንግሊዝኛ</div>
      <section className="onboarding-panel" aria-labelledby="welcome-title">
        {step === 1 ? (
          <>
            <div className="onboarding-icons" aria-hidden="true"><Mic2 /><BookOpen /></div>
            <p className="amharic-kicker">እንኳን ደህና መጡ</p>
            <h1 id="welcome-title">በየቀኑ የሚጠቀሙበትን እንግሊዝኛ ይማሩ</h1>
            <p>በአማርኛ ይማሩ። በእንግሊዝኛ ይናገሩ፣ ያዳምጡ እና ያንብቡ።</p>
            <label>
              ምን ብለን እንጥራዎ?
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="ስምዎ" autoFocus />
            </label>
            <button className="primary-button wide" onClick={() => setStep(2)} disabled={!name.trim()}>
              ቀጥል <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            <p className="amharic-kicker">ትምህርቱን እናስተካክል</p>
            <h1 id="welcome-title">የመጀመሪያ ደረጃዎን ይምረጡ</h1>
            <fieldset className="choice-list">
              <legend>አሁን ምን ያህል እንግሊዝኛ መጠቀም ይችላሉ?</legend>
              {[
                ["beginner", "ጀማሪ", "ጥቂት ቃላትንና ሐረጎችን አውቃለሁ።"],
                ["intermediate", "መካከለኛ", "አጭር ውይይት ማድረግ እችላለሁ።"],
                ["advanced", "ከፍተኛ", "ግልጽና ተፈጥሯዊ እንግሊዝኛ መናገር እፈልጋለሁ።"]
              ].map(([value, label, description]) => (
                <label key={value} className={level === value ? "selected" : ""}>
                  <input type="radio" name="level" value={value} checked={level === value} onChange={() => setLevel(value as Level)} />
                  <span><strong>{label}</strong><small>{description}</small></span>
                </label>
              ))}
            </fieldset>
            <fieldset className="goal-options">
              <legend>የዕለት ግብ</legend>
              {[10, 15, 20].map((minutes) => (
                <button key={minutes} className={goal === minutes ? "selected" : ""} onClick={() => setGoal(minutes)}>{minutes} ደቂቃ</button>
              ))}
            </fieldset>
            <button className="primary-button wide" onClick={() => onComplete(name, level, goal)}>
              ትምህርት ይጀምሩ <ArrowRight size={18} />
            </button>
          </>
        )}
      </section>
    </div>
  );
}
