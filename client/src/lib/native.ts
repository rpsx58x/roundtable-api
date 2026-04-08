/**
 * RoundTable — Native Platform Integrations
 * Wraps Capacitor plugins with safe web fallbacks so the same
 * code runs in both the browser and native iOS/Android apps.
 */

// Dynamic import guards — Capacitor is tree-shaken in web builds
let _capacitorCore: typeof import("@capacitor/core") | null = null;

async function getCapacitor() {
  if (!_capacitorCore) {
    _capacitorCore = await import("@capacitor/core");
  }
  return _capacitorCore;
}

/** True when running inside a Capacitor iOS or Android app */
export async function isNativePlatform(): Promise<boolean> {
  try {
    const { Capacitor } = await getCapacitor();
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Initialize native UI: hide splash screen, configure status bar.
 * Call once from App.tsx on mount.
 */
export async function initNativeApp(): Promise<void> {
  const native = await isNativePlatform();
  if (!native) return;

  try {
    const [{ SplashScreen }, { StatusBar, Style }] = await Promise.all([
      import("@capacitor/splash-screen"),
      import("@capacitor/status-bar"),
    ]);

    // Match status bar to RoundTable dark theme
    await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    await StatusBar.setBackgroundColor({ color: "#0E0F18" }).catch(() => {});

    // Give the app a beat to render before hiding splash
    setTimeout(() => SplashScreen.hide({ fadeOutDuration: 300 }), 400);
  } catch (e) {
    console.warn("[RoundTable] initNativeApp error:", e);
  }
}

/**
 * Trigger haptic feedback — silently skipped on web.
 * @param style  'light' | 'medium' | 'heavy' | 'selection'
 */
export async function haptic(
  style: "light" | "medium" | "heavy" | "selection" = "medium",
): Promise<void> {
  const native = await isNativePlatform();
  if (!native) return;

  try {
    const { Haptics, ImpactStyle, NotificationType } = await import(
      "@capacitor/haptics"
    );
    if (style === "selection") {
      await Haptics.selectionChanged();
    } else {
      const map = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      } as const;
      await Haptics.impact({ style: map[style] });
    }
  } catch {}
}

/**
 * Request geolocation and return coords.
 * Falls back to browser navigator.geolocation on web.
 */
export async function getCurrentPosition(): Promise<{
  lat: number;
  lng: number;
} | null> {
  const native = await isNativePlatform();

  if (native) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== "granted" && perm.coarseLocation !== "granted") {
        return null;
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return null;
    }
  }

  // Web fallback
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000 },
    );
  });
}

/**
 * Register for push notifications (iOS prompts for permission).
 * Returns the FCM/APNs token, or null on failure/web.
 */
export async function registerPushNotifications(): Promise<string | null> {
  const native = await isNativePlatform();
  if (!native) return null;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const result = await PushNotifications.requestPermissions();
    if (result.receive !== "granted") return null;

    await PushNotifications.register();

    return new Promise((resolve) => {
      PushNotifications.addListener("registration", (token) => {
        resolve(token.value);
      });
      PushNotifications.addListener("registrationError", () => resolve(null));
      // Timeout after 5s
      setTimeout(() => resolve(null), 5000);
    });
  } catch {
    return null;
  }
}

/**
 * Schedule a local notification (e.g. "Dinner at Carbone in 1 hour").
 */
export async function scheduleEventReminder(opts: {
  title: string;
  body: string;
  at: Date;
}): Promise<void> {
  const native = await isNativePlatform();
  if (!native) return;

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== "granted") return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title: opts.title,
          body: opts.body,
          schedule: { at: opts.at },
          sound: undefined,
          smallIcon: "ic_stat_roundtable",
          iconColor: "#C99A2E",
        },
      ],
    });
  } catch (e) {
    console.warn("[RoundTable] scheduleEventReminder:", e);
  }
}

/**
 * Handle Android hardware back button.
 * Call in your root component; pass a callback that returns true to consume the event.
 */
export async function onBackButton(handler: () => boolean): Promise<void> {
  const native = await isNativePlatform();
  if (!native) return;

  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      const consumed = handler();
      if (!consumed && !canGoBack) App.exitApp();
    });
  } catch {}
}
