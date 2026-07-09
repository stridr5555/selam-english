import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const REMINDER_ID = 1988;
let webTimer: number | undefined;

export type ReminderResult = {
  ok: boolean;
  message: string;
};

export async function schedulePracticeReminder(time: string): Promise<ReminderResult> {
  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return { ok: false, message: "Choose a valid reminder time." };
  }

  if (Capacitor.isNativePlatform()) {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== "granted") {
      return { ok: false, message: "Notification permission is off." };
    }

    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: "የዛሬን እንግሊዝኛ እንለማመድ",
          body: "A short speaking lesson is ready.",
          schedule: { on: { hour, minute }, repeats: true },
          smallIcon: "ic_stat_icon_config_sample"
        }
      ]
    });
    return { ok: true, message: `Daily reminder set for ${formatTime(time)}.` };
  }

  if (!("Notification" in window)) {
    return { ok: false, message: "This browser does not support notifications." };
  }

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== "granted") {
    return { ok: false, message: "Notification permission is off." };
  }

  window.clearTimeout(webTimer);
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
  webTimer = window.setTimeout(showWebNotification, next.getTime() - Date.now());
  await showWebNotification(true);
  return {
    ok: true,
    message: `Reminder set for ${formatTime(time)} while Selam English is open or installed.`
  };
}

export async function cancelPracticeReminder() {
  window.clearTimeout(webTimer);
  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  }
}

async function showWebNotification(testOnly = false) {
  const registration = await navigator.serviceWorker?.getRegistration();
  const options = {
    body: testOnly
      ? "Reminders are ready. Your daily lesson will appear at the chosen time."
      : "A short speaking lesson is ready.",
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
    tag: "selam-daily-practice"
  };
  if (registration) await registration.showNotification("Selam English", options);
  else new Notification("Selam English", options);
}

export function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(2026, 0, 1, hour, minute));
}
