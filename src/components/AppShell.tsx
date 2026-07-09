import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Flame,
  HelpCircle,
  Mic2,
  RotateCcw,
  Settings,
  Volume2
} from "lucide-react";
import type { ReactNode } from "react";
import type { LearningProgress, ViewId } from "../types/learning";

const primaryNav: Array<{
  id: Exclude<ViewId, "settings">;
  label: string;
  amharic: string;
  icon: typeof CalendarDays;
}> = [
  { id: "today", label: "Today", amharic: "ዛሬ", icon: CalendarDays },
  { id: "speak", label: "Speak", amharic: "መናገር", icon: Mic2 },
  { id: "read", label: "Read", amharic: "ማንበብ", icon: BookOpen },
  { id: "review", label: "Review", amharic: "ክለሳ", icon: RotateCcw },
  { id: "progress", label: "Progress", amharic: "እድገት", icon: BarChart3 }
];

export function AppShell({
  children,
  progress,
  view,
  onNavigate
}: {
  children: ReactNode;
  progress: LearningProgress;
  view: ViewId;
  onNavigate: (view: ViewId) => void;
}) {
  const learnerName = progress.profile.name || "Learner";
  const progressPercent = Math.min(100, (progress.learnedWords.length / 5000) * 100);

  return (
    <div className="app-frame">
      <aside className="desktop-sidebar" aria-label="Main navigation">
        <button className="brand" onClick={() => onNavigate("today")} aria-label="Selam English home">
          <span className="brand-symbol"><Volume2 size={20} /></span>
          <span><strong>Selam English</strong><small>ሰላም እንግሊዝኛ</small></span>
        </button>

        <nav className="side-nav">
          {primaryNav.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => onNavigate(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <item.icon size={20} />
              <span><strong>{item.label}</strong><small>{item.amharic}</small></span>
            </button>
          ))}
        </nav>

        <div className="sidebar-progress">
          <div><span>Speaking words</span><strong>{progress.learnedWords.length.toLocaleString()} / 5,000</strong></div>
          <div className="meter" aria-label={`${progressPercent.toFixed(1)} percent of speaking vocabulary complete`}>
            <span style={{ width: `${Math.max(1, progressPercent)}%` }} />
          </div>
        </div>

        <div className="sidebar-footer">
          <button onClick={() => onNavigate("settings")} className={view === "settings" ? "active" : ""}>
            <Settings size={19} /> Settings
          </button>
          <a href="mailto:support@selamenglish.app"><HelpCircle size={19} /> Help</a>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div>
            <p>ሰላም, {learnerName}!</p>
            <span>{getHeaderSubtitle(view)}</span>
          </div>
          <div className="header-actions">
            <div className="streak"><Flame size={21} /><strong>{progress.streakCount}</strong><span>day streak</span></div>
            <button className="avatar-button" onClick={() => onNavigate("settings")} aria-label="Open profile settings">
              {(learnerName[0] || "L").toUpperCase()}
            </button>
          </div>
        </header>
        <main className="content" id="main-content">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Main navigation">
        {primaryNav.map((item) => (
          <button
            key={item.id}
            className={view === item.id ? "active" : ""}
            onClick={() => onNavigate(item.id)}
            aria-current={view === item.id ? "page" : undefined}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
function getHeaderSubtitle(view: ViewId) {
  if (view === "today") return "Your daily English plan";
  if (view === "speak") return "Speaking fluency";
  if (view === "read") return "Reading comprehension";
  if (view === "review") return "Remember what you learned";
  if (view === "progress") return "Your learning record";
  return "Learning preferences";
}
