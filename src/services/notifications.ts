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
    return { ok: false, message: "ትክክለኛ የማስታወሻ ሰዓት ይምረጡ።" };
  }

  if (Capacitor.isNativePlatform()) {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== "granted") {
      return { ok: false, message: "የማሳወቂያ ፈቃድ ጠፍቷል።" };
    }

    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: "የዛሬን እንግሊዝኛ እንለማመድ",
          body: "አጭር የመናገር ትምህርት ዝግጁ ነው።",
          schedule: { on: { hour, minute }, repeats: true },
          smallIcon: "ic_stat_icon_config_sample"
        }
      ]
    });
    return { ok: true, message: `የዕለት ማስታወሻው ለ${formatTime(time)} ተይዟል።` };
  }

  if (!("Notification" in window)) {
    return { ok: false, message: "ይህ አሳሽ ማሳወቂያዎችን አይደግፍም።" };
  }

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== "granted") {
    return { ok: false, message: "የማሳወቂያ ፈቃድ ጠፍቷል።" };
  }

  window.clearTimeout(webTimer);
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
  webTimer = window.setTimeout(showWebNotification, next.getTime() - Date.now());
  await showWebNotification(true);
  return {
    ok: true,
    message: `ሰላም እንግሊዝኛ ክፍት ወይም የተጫነ ሲሆን ማስታወሻው ለ${formatTime(time)} ተይዟል።`
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
      ? "ማስታወሻዎቹ ዝግጁ ናቸው። የዕለት ትምህርትዎ በመረጡት ሰዓት ይታያል።"
      : "አጭር የመናገር ትምህርት ዝግጁ ነው።",
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
    tag: "selam-daily-practice"
  };
  if (registration) await registration.showNotification("ሰላም እንግሊዝኛ", options);
  else new Notification("ሰላም እንግሊዝኛ", options);
}

export function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("am-ET", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(2026, 0, 1, hour, minute));
}
