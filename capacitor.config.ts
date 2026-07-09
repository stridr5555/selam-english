import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.selamenglish.app",
  appName: "Selam English",
  webDir: "dist",
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_selam",
      iconColor: "#005f45"
    }
  }
};

export default config;
