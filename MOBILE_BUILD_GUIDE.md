# RoundTable — Mobile Build Guide
App ID: `com.roundtable.app`

---

## What's Already Done

| Asset | Status |
|---|---|
| Capacitor 8 wired up | ✅ |
| Android project (`/android`) | ✅ |
| iOS Xcode project (`/ios`) | ✅ |
| All 8 native plugins registered | ✅ |
| App icons — all Android sizes (mdpi → xxxhdpi) | ✅ |
| App icons — all iOS sizes (20px → 1024px) | ✅ |
| Splash screens (Android + iOS, 1920×1920, dark) | ✅ |
| AndroidManifest.xml (all permissions + deep links) | ✅ |
| iOS Info.plist (all permissions + URL schemes) | ✅ |
| Android colors, strings, network security config | ✅ |
| Android `build.gradle` with release signing config | ✅ |
| Native feature hooks: geolocation, haptics, push, status bar | ✅ |
| **Debug APK** (`RoundTable-debug.apk`, 6.1 MB) | ✅ Built |
| Release APK / AAB for Play Store | ⚙️ See below |
| IPA for App Store | ⚙️ Requires Mac + Xcode |

---

## Step 1 — Deploy the Backend

The native app needs an API endpoint. Deploy the Express server to:

| Platform | Command |
|---|---|
| Railway | `railway up` in `/` |
| Render | Create Web Service → `npm start` |
| Fly.io | `fly launch && fly deploy` |

Once deployed, update `.env.native`:
```
VITE_API_BASE_URL=https://your-api-domain.com
```

Then rebuild: `npm run build:native`

---

## Step 2 — Android

### Debug APK (already built — for testing on device)
```bash
adb install RoundTable-debug.apk
```

### Release AAB (for Google Play — preferred)
1. Generate a keystore (once):
```bash
keytool -genkey -v \
  -keystore roundtable-release.keystore \
  -alias roundtable \
  -keyalg RSA -keysize 2048 -validity 10000
```

2. Create `android/keystore.properties`:
```properties
storeFile=roundtable-release.keystore
storePassword=YOUR_PASSWORD
keyAlias=roundtable
keyPassword=YOUR_KEY_PASSWORD
```

3. Uncomment the signing config in `android/app/build.gradle` (line 56):
```groovy
signingConfig signingConfigs.release
```

4. Build the release AAB:
```bash
cd android
JAVA_HOME=~/jdk21 ANDROID_SDK_ROOT=~/android-sdk ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Upload to Google Play
- Go to [Google Play Console](https://play.google.com/console)
- Create new app → Internal Testing → Upload `.aab`

---

## Step 3 — iOS (requires macOS + Xcode 15+)

### Setup
```bash
# On your Mac, clone or copy the project, then:
cd roundtable
npm install
npm run build:native    # uses VITE_API_BASE_URL from .env.native

npx cap sync ios        # copies built web assets into Xcode project

cd ios/App
pod install             # installs Capacitor plugin Pods
```

### Open in Xcode
```bash
npx cap open ios
# or:
open ios/App/App.xcworkspace
```

### Configure Signing in Xcode
1. Select the `App` target
2. Go to **Signing & Capabilities**
3. Set **Team** to your Apple Developer account
4. Bundle ID is already set to `com.roundtable.app`
5. Add **Associated Domains**: `applinks:roundtable.app`

### Build IPA for TestFlight / App Store
```bash
# From command line (after Xcode signing is configured):
xcodebuild -workspace ios/App/App.xcworkspace \
           -scheme App \
           -configuration Release \
           -archivePath RoundTable.xcarchive \
           archive

xcodebuild -exportArchive \
           -archivePath RoundTable.xcarchive \
           -exportPath ./RoundTable-IPA \
           -exportOptionsPlist ExportOptions.plist
```

Or use **Xcode → Product → Archive** and upload via Organizer.

---

## Step 4 — Firebase (Push Notifications)

### Android
1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add Android app → package `com.roundtable.app`
3. Download `google-services.json` → place in `android/app/`
4. Rebuild: `./gradlew assembleRelease`

### iOS
1. Add iOS app to same Firebase project → bundle `com.roundtable.app`
2. Download `GoogleService-Info.plist` → place in `ios/App/App/`
3. In Xcode → Signing & Capabilities → add **Push Notifications** + **Background Modes** → Remote notifications

---

## Native Plugins Wired

| Plugin | Capability |
|---|---|
| `@capacitor/geolocation` | GPS location for Discover map |
| `@capacitor/push-notifications` | "Someone joined your event" alerts |
| `@capacitor/local-notifications` | "Dinner at Carbone in 1 hour" reminders |
| `@capacitor/haptics` | Tap feedback on buttons |
| `@capacitor/status-bar` | Dark status bar matching RoundTable theme |
| `@capacitor/splash-screen` | Gold-on-dark branded splash |
| `@capacitor/keyboard` | Keyboard-aware layout for messaging |
| `@capacitor/app` | Android back button + app lifecycle |

---

## Update the App (After Code Changes)

```bash
# 1. Edit React code
# 2. Rebuild web assets
npm run build:native

# 3. Sync to native platforms
npx cap sync

# 4. Rebuild native
cd android && ./gradlew assembleRelease   # Android
npx cap open ios                          # iOS → rebuild in Xcode
```

---

## App Store Checklist

### Google Play
- [x] App ID: `com.roundtable.app`
- [x] Target SDK: 34 (Android 14)
- [x] Min SDK: 22 (Android 5.1, covers 99%+ of devices)
- [ ] Release AAB signed
- [ ] Privacy policy URL
- [ ] Screenshots (phone + tablet)
- [ ] Feature graphic (1024×500)
- [ ] Store listing copy

### Apple App Store
- [x] Bundle ID: `com.roundtable.app`
- [x] Min iOS: 14.0
- [x] All privacy usage strings in Info.plist
- [ ] Apple Developer account ($99/yr)
- [ ] Distribution certificate + provisioning profile
- [ ] App Store screenshots (6.7", 6.5", 5.5")
- [ ] Privacy manifest (PrivacyInfo.xcprivacy) — required 2024+
- [ ] Store listing copy + keywords
