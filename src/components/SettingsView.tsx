import { Bell, BellOff, Download, RotateCcw, Save, ShieldCheck, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { speakText } from "../services/edgeTts";
import { formatTime } from "../services/notifications";
import type { LearnerProfile, Level } from "../types/learning";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function SettingsView({
  profile,
  reminderMessage,
  onSave,
  onSetReminder,
  onDisableReminder,
  onReset
}: {
  profile: LearnerProfile;
  reminderMessage: string;
  onSave: (updates: Partial<LearnerProfile>) => void;
  onSetReminder: (time: string) => Promise<void>;
  onDisableReminder: () => Promise<void>;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(profile), [profile]);

  useEffect(() => {
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);

  function save() {
    onSave(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function reset() {
    if (window.confirm("በዚህ መሣሪያ ላይ ያለውን የሰላም እንግሊዝኛ እድገት ሰርዘው እንደገና ይጀምሩ?")) onReset();
  }

  return (
    <div className="settings-view">
      <section className="page-heading compact-heading"><div><h1>ቅንብሮች</h1><p>የትምህርት ደረጃዎን፣ የዕለት ግብዎን እና ማስታወሻዎን ያስተካክሉ።</p></div></section>
      <div className="settings-layout">
        <section className="settings-section">
          <div className="settings-section-title"><h2>የትምህርት መገለጫ</h2><p>ትምህርቶችና የጄሚኒ ልምምድ እነዚህን ምርጫዎች ይጠቀማሉ።</p></div>
          <div className="settings-fields">
            <label><span>ስም</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label><span>የእንግሊዝኛ ደረጃ</span><select value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value as Level })}><option value="beginner">ጀማሪ</option><option value="intermediate">መካከለኛ</option><option value="advanced">ከፍተኛ</option></select></label>
            <label><span>የዕለት ግብ</span><select value={draft.dailyGoalMinutes} onChange={(event) => setDraft({ ...draft, dailyGoalMinutes: Number(event.target.value) })}><option value={10}>10 ደቂቃ</option><option value={15}>15 ደቂቃ</option><option value={20}>20 ደቂቃ</option><option value={30}>30 ደቂቃ</option></select></label>
          </div>
          <button className="primary-button" onClick={save}><Save size={18} />{saved ? "ተቀምጧል" : "መገለጫውን አስቀምጥ"}</button>
        </section>

        <section className="settings-section">
          <div className="settings-section-title"><h2>የአነጋገር ድምፅ</h2><p>ጥራት ያለው የማይክሮሶፍት ኤጅ ነርቭ ድምፅ የምሳሌ ቃላትንና ዓረፍተ ነገሮችን ያነባል። ፍጥነቱን ይምረጡ።</p></div>
          <div className="range-field"><label htmlFor="voice-rate"><Volume2 size={20} />የማጫወት ፍጥነት</label><input id="voice-rate" type="range" min="0.55" max="1" step="0.05" value={draft.voiceRate} onChange={(event) => setDraft({ ...draft, voiceRate: Number(event.target.value) })} /><output>{draft.voiceRate < 0.68 ? "በጣም ቀስ" : draft.voiceRate < 0.85 ? "ቀስ" : "ተፈጥሯዊ"}</output></div>
          <button className="secondary-button" onClick={() => speakText("I am practicing English every day.", draft.voiceRate)}>ድምፁን ፈትሽ <Volume2 size={18} /></button>
        </section>

        <section className="settings-section">
          <div className="settings-section-title"><h2>የዕለት ማስታወሻ</h2><p>የአንድሮይድና የአይፎን መተግበሪያዎች በመሣሪያው ላይ ማሳወቂያ ያስይዛሉ። የተጫነው የድር መተግበሪያም ሲሠራ ያስታውስዎታል።</p></div>
          <div className="reminder-control"><label><span>የማስታወሻ ሰዓት</span><input type="time" value={draft.reminderTime} onChange={(event) => setDraft({ ...draft, reminderTime: event.target.value })} /></label><span>{formatTime(draft.reminderTime)}</span></div>
          <p className="setting-status" role="status">{reminderMessage}</p>
          <div className="button-row"><button className="primary-button" onClick={() => onSetReminder(draft.reminderTime)}><Bell size={18} />ማስታወሻውን አብራ</button>{profile.remindersEnabled ? <button className="secondary-button" onClick={onDisableReminder}><BellOff size={18} />አጥፋ</button> : null}</div>
        </section>

        <section className="settings-section">
          <div className="settings-section-title"><h2>መተግበሪያውን ይጫኑ</h2><p>በሙሉ ማያ ገጽ ለመጠቀምና ያለ በይነመረብ ትምህርቶችን ለማግኘት ሰላም እንግሊዝኛን ይጫኑ።</p></div>
          <button className="secondary-button" onClick={install} disabled={!installPrompt}><Download size={18} />{installPrompt ? "የድር መተግበሪያውን ጫን" : "ተጭኗል ወይም አይገኝም"}</button>
        </section>

        <section className="settings-section privacy-section">
          <div className="settings-section-title"><h2><ShieldCheck size={20} />ግላዊነት</h2><p>የትምህርት እድገትዎ በዚህ መሣሪያ ላይ ይቀመጣል። በውይይት ጊዜ የድምፅ መረጃ በቀጥታ ወደ ጄሚኒ ይላካል፤ ልምምዱን ሲጨርሱ ይቆማል።</p></div>
        </section>

        <section className="settings-section danger-section">
          <div className="settings-section-title"><h2>እንደገና ይጀምሩ</h2><p>በዚህ መሣሪያ ላይ ያሉ እድገት፣ ውጤቶች፣ የክለሳ ቃላትና ምርጫዎች ይሰረዛሉ።</p></div>
          <button className="danger-button" onClick={reset}><RotateCcw size={18} />እድገቱን አዲስ አድርግ</button>
        </section>
      </div>
    </div>
  );
}
