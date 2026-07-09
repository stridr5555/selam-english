import { Bell, BellOff, Download, RotateCcw, Save, ShieldCheck, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { speakText } from "../services/geminiVoice";
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
    if (window.confirm("Delete your local Selam English progress and start again?")) onReset();
  }

  return (
    <div className="settings-view">
      <section className="page-heading compact-heading"><div><h1>Settings</h1><p>የትምህርት ደረጃዎን፣ የዕለት ግብዎን እና ማስታወሻዎን ያስተካክሉ።</p></div></section>
      <div className="settings-layout">
        <section className="settings-section">
          <div className="settings-section-title"><h2>Learning profile</h2><p>Lessons and Gemini practice use these preferences.</p></div>
          <div className="settings-fields">
            <label><span>Name</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label><span>English level</span><select value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value as Level })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
            <label><span>Daily goal</span><select value={draft.dailyGoalMinutes} onChange={(event) => setDraft({ ...draft, dailyGoalMinutes: Number(event.target.value) })}><option value={10}>10 minutes</option><option value={15}>15 minutes</option><option value={20}>20 minutes</option><option value={30}>30 minutes</option></select></label>
          </div>
          <button className="primary-button" onClick={save}><Save size={18} />{saved ? "Saved" : "Save profile"}</button>
        </section>

        <section className="settings-section">
          <div className="settings-section-title"><h2>Pronunciation audio</h2><p>Choose how slowly example words and sentences play.</p></div>
          <div className="range-field"><label htmlFor="voice-rate"><Volume2 size={20} />Playback speed</label><input id="voice-rate" type="range" min="0.55" max="1" step="0.05" value={draft.voiceRate} onChange={(event) => setDraft({ ...draft, voiceRate: Number(event.target.value) })} /><output>{draft.voiceRate < 0.68 ? "Very slow" : draft.voiceRate < 0.85 ? "Slow" : "Natural"}</output></div>
          <button className="secondary-button" onClick={() => speakText("I am practicing English every day.", draft.voiceRate)}>Test audio <Volume2 size={18} /></button>
        </section>

        <section className="settings-section">
          <div className="settings-section-title"><h2>Daily reminder</h2><p>Native Android and iPhone builds schedule a local notification. The installed web app reminds you while it can run.</p></div>
          <div className="reminder-control"><label><span>Reminder time</span><input type="time" value={draft.reminderTime} onChange={(event) => setDraft({ ...draft, reminderTime: event.target.value })} /></label><span>{formatTime(draft.reminderTime)}</span></div>
          <p className="setting-status" role="status">{reminderMessage}</p>
          <div className="button-row"><button className="primary-button" onClick={() => onSetReminder(draft.reminderTime)}><Bell size={18} />Enable reminder</button>{profile.remindersEnabled ? <button className="secondary-button" onClick={onDisableReminder}><BellOff size={18} />Turn off</button> : null}</div>
        </section>

        <section className="settings-section">
          <div className="settings-section-title"><h2>Install the app</h2><p>Install Selam English for a full-screen app experience and offline lesson access.</p></div>
          <button className="secondary-button" onClick={install} disabled={!installPrompt}><Download size={18} />{installPrompt ? "Install web app" : "Already installed or unavailable"}</button>
        </section>

        <section className="settings-section privacy-section">
          <div className="settings-section-title"><h2><ShieldCheck size={20} />Privacy</h2><p>Your lesson progress stays on this device. Voice audio streams directly to Gemini during an active conversation and stops when you end it.</p></div>
        </section>

        <section className="settings-section danger-section">
          <div className="settings-section-title"><h2>Start over</h2><p>Remove local progress, scores, review words, and preferences from this device.</p></div>
          <button className="danger-button" onClick={reset}><RotateCcw size={18} />Reset progress</button>
        </section>
      </div>
    </div>
  );
}
