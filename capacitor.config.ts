import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.schilltech.roundtable",
  appName: "RoundTable",
  webDir: "dist/public",

  server: {
    // androidScheme must be 'https' for secure cookies and modern APIs
    androidScheme: "https",
    // iosScheme must be 'https' for WKWebView compatibility
    iosScheme: "https",
    // For local dev testing on device, uncomment and set your machine's LAN IP:
    // url: "http://192.168.1.100:5000",
    // cleartext: true,
    //
    // For production: remove the url override entirely.
    // The app will serve bundled assets locally and API calls
    // will use VITE_API_BASE_URL (set in your .env.native file).
  },

  plugins: {
    // ── Splash Screen ────────────────────────────────────────────────────
    SplashScreen: {
      launchShowDuration: 2200,
      launchAutoHide: true,
      backgroundColor: "#0E0F18",        // RoundTable dark bg
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      iosSplashResourceName: "Default",
    },

    // ── Status Bar ───────────────────────────────────────────────────────
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0E0F18",
      overlaysWebView: false,
    },

    // ── Push Notifications ───────────────────────────────────────────────
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },

    // ── Local Notifications ───────────────────────────────────────────────
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#C99A2E",              // RoundTable gold
      sound: "beep.wav",
    },

    // ── Keyboard ────────────────────────────────────────────────────────
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    },

    // ── Geolocation ──────────────────────────────────────────────────────
    // Permissions are requested at runtime from the native code
    Geolocation: {},
  },

  // ── iOS-specific overrides ────────────────────────────────────────────
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
    // Minimum iOS version: 14.0
    minVersion: "14.0",
  },

  // ── Android-specific overrides ────────────────────────────────────────
  android: {
    // Allow mixed content only in debug builds
    allowMixedContent: false,
    captureInput: true,
    // Minimum SDK: 22 (Android 5.1) — covers 99%+ of active devices
    minWebViewVersion: 60,
  },
};

export default config;
