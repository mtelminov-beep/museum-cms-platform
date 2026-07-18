import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.museumcms.kiosk",
  appName: "Museum CMS Kiosk",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https"
  },
  android: {
    allowMixedContent: true
  }
};

export default config;

