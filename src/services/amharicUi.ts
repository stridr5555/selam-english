import type { Level } from "../types/learning";

const topicLabels: Record<string, string> = {
  "Morning routine": "የጠዋት ልማድ",
  "Polite requests": "በትህትና መጠየቅ",
  "Work and schedules": "ሥራና የጊዜ ሰሌዳ",
  "Home life": "የቤት ኑሮ",
  Transport: "መጓጓዣ",
  "Eating out": "ከቤት ውጭ መመገብ",
  "Getting help": "እርዳታ መጠየቅ",
  "People and family": "ሰዎችና ቤተሰብ",
  "Everyday English": "የዕለት ተዕለት እንግሊዝኛ"
};

export function levelLabel(level: Level) {
  if (level === "beginner") return "ጀማሪ";
  if (level === "intermediate") return "መካከለኛ";
  return "ከፍተኛ";
}

export function topicLabel(topic: string) {
  if (/[\u1200-\u137f]/.test(topic)) return topic;
  return topicLabels[topic] ?? "የዕለት ተዕለት እንግሊዝኛ";
}

export function minutesLabel(minutes: number) {
  return `${minutes} ደቂቃ`;
}
