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
  description: string;
  icon: typeof CalendarDays;
}> = [
  { id: "today", label: "ዛሬ", description: "የዕለት እቅድ", icon: CalendarDays },
  { id: "speak", label: "መናገር", description: "የድምፅ ልምምድ", icon: Mic2 },
  { id: "read", label: "ማንበብ", description: "የንባብ ግንዛቤ", icon: BookOpen },
  { id: "review", label: "ክለሳ", description: "የቃላት ድግግሞሽ", icon: RotateCcw },
  { id: "progress", label: "እድገት", description: "የትምህርት ውጤት", icon: BarChart3 }
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
  const learnerName = progress.profile.name || "ተማሪ";
  const progressPercent = Math.min(100, (progress.learnedWords.length / 5000) * 100);

  return (
    <div className="app-frame">
      <aside className="desktop-sidebar" aria-label="ዋና መምረጫ">
        <button className="brand" onClick={() => onNavigate("today")} aria-label="ወደ ሰላም እንግሊዝኛ መነሻ">
          <span className="brand-symbol"><Volume2 size={20} /></span>
          <span><strong>ሰላም እንግሊዝኛ</strong><small>በአማርኛ ይማሩ</small></span>
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
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
            </button>
          ))}
        </nav>

        <div className="sidebar-progress">
          <div><span>የተማሩ የመናገር ቃላት</span><strong>{progress.learnedWords.length.toLocaleString()} / 5,000</strong></div>
          <div className="meter" aria-label={`ከመናገር ቃላት ${progressPercent.toFixed(1)} በመቶ ተጠናቋል`}>
            <span style={{ width: `${Math.max(1, progressPercent)}%` }} />
          </div>
        </div>

        <div className="sidebar-footer">
          <button onClick={() => onNavigate("settings")} className={view === "settings" ? "active" : ""}>
            <Settings size={19} /> ቅንብሮች
          </button>
          <a href="mailto:support@selamenglish.app"><HelpCircle size={19} /> እገዛ</a>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div>
            <p>ሰላም, {learnerName}!</p>
            <span>{getHeaderSubtitle(view)}</span>
          </div>
          <div className="header-actions">
            <div className="streak"><Flame size={21} /><strong>{progress.streakCount}</strong><span>ቀን ተከታታይ</span></div>
            <button className="avatar-button" onClick={() => onNavigate("settings")} aria-label="የመገለጫ ቅንብሮችን ክፈት">
              {(learnerName[0] || "ተ").toUpperCase()}
            </button>
          </div>
        </header>
        <main className="content" id="main-content">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="ዋና መምረጫ">
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
  if (view === "today") return "የዕለት የእንግሊዝኛ እቅድዎ";
  if (view === "speak") return "የመናገር ብቃት";
  if (view === "read") return "የንባብ ግንዛቤ";
  if (view === "review") return "የተማሩትን ያስታውሱ";
  if (view === "progress") return "የትምህርት መዝገብዎ";
  return "የትምህርት ምርጫዎች";
}
