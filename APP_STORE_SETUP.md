# RoundTable — App Store Setup Guide

Everything is automated. You just need to add secrets to GitHub once.
Navigate to: **github.com/rpsx58x/roundtable-api → Settings → Secrets → Actions**

---

## Google Play (Android) — 4 secrets

### Step 1 — Register as a Google Play developer ($25 one-time)
1. Go to **play.google.com/console/developers**
2. Pay the $25 registration fee
3. Accept the Developer Distribution Agreement

### Step 2 — Create the RoundTable app
1. Click **Create app**
2. App name: `RoundTable`
3. Default language: `English (US)`
4. App or game: `App`
5. Free or paid: `Free`
6. Accept all declarations → **Create app**

### Step 3 — Set up Internal Testing
1. Left sidebar → **Testing → Internal testing**
2. **Upload the AAB manually first time** (the file is at `RoundTable-release.aab` in this repo)
3. Add your own email as a tester
4. Publish the draft release

### Step 4 — Create a Google Play Service Account for CI
1. In Play Console → **Setup → API access**
2. Click **Link to a Google Cloud project** (create one if needed)
3. In Google Cloud Console → **IAM → Service Accounts** → Create
   - Name: `roundtable-ci`
   - Role: **Service Account User**
4. Back in Play Console → Grant access to the service account
   - Role: **Release manager** (or Admin)
5. In Cloud Console → Service Account → **Keys → Add Key → JSON**
6. Download the JSON file

### Step 5 — Add GitHub Secrets
```
Secret name: ANDROID_KEYSTORE_BASE64
Value: base64 -i android/app/roundtable-release.keystore | pbcopy
(The keystore is already built. This command encodes it for GitHub.)

Secret name: ANDROID_KEYSTORE_PASSWORD
Value: RoundTable2026!

Secret name: ANDROID_KEY_PASSWORD
Value: RoundTable2026!

Secret name: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
Value: (paste the entire JSON content from Step 4)
```

---

## Apple App Store (iOS) — 5 secrets

### Step 1 — Apple Developer account ($99/year)
1. Go to **developer.apple.com/account**
2. Enroll as an Individual or Organization developer
3. Pay $99/year

### Step 2 — Register the App ID
1. **developer.apple.com → Certificates, IDs & Profiles → Identifiers**
2. Register App ID: `com.schilltech.roundtable`
3. Enable capabilities: Push Notifications, Associated Domains

### Step 3 — Create the app in App Store Connect
1. **appstoreconnect.apple.com → My Apps → +**
2. New App:
   - Platform: iOS
   - Name: `RoundTable`
   - Bundle ID: `com.schilltech.roundtable`
   - SKU: `roundtable-ios-001`
3. **Agree to all Paid Applications Agreement** (required even for free apps)

### Step 4 — Create App Store Connect API key
1. **appstoreconnect.apple.com → Users & Access → Integrations → App Store Connect API**
2. Click **+** to create a new key
3. Name: `roundtable-ci`, Access: **App Manager**
4. Download the `.p8` file (download once — it disappears after)
5. Note the **Key ID** and **Issuer ID**

### Step 5 — Create distribution certificate + provisioning profile
On your Mac:
```bash
# Open Xcode → Settings → Accounts → add your Apple ID
# Then in your project: Xcode → Signing & Capabilities → 
#   Team: your team, Automatically manage signing: ON
# Xcode will create the certificate automatically
```

Then export the certificate:
1. Open **Keychain Access** on your Mac
2. Find `Apple Distribution: <Your Name>`
3. Right-click → **Export** → save as `roundtable-dist.p12`
4. Set a password for the .p12

Export the provisioning profile:
1. **developer.apple.com → Profiles → +**
2. Type: **App Store Distribution**
3. App ID: `com.schilltech.roundtable`
4. Certificate: select the one you just created
5. Profile name: `RoundTable AppStore`
6. Download: `RoundTable_AppStore.mobileprovision`

### Step 6 — Add GitHub Secrets
```
Secret name: APPLE_TEAM_ID
Value: (10-char Team ID from developer.apple.com/account/#!/membership)

Secret name: APPLE_API_KEY_ID
Value: (Key ID from Step 4, e.g. ABCD1234EF)

Secret name: APPLE_API_ISSUER_ID
Value: (Issuer ID from Step 4, UUID format)

Secret name: APPLE_API_KEY_CONTENT
Value: base64 -i AuthKey_XXXXX.p8 | pbcopy
(base64-encode the .p8 key content)

Secret name: BUILD_CERTIFICATE_BASE64
Value: base64 -i roundtable-dist.p12 | pbcopy

Secret name: P12_PASSWORD
Value: (password you set when exporting the .p12)

Secret name: BUILD_PROVISION_PROFILE_BASE64
Value: base64 -i RoundTable_AppStore.mobileprovision | pbcopy

Secret name: KEYCHAIN_PASSWORD
Value: (any strong password — used temporarily in CI)
```

---

## After adding secrets

Every push to `main` will:
1. **Android**: Build signed AAB → Upload to Google Play Internal Testing automatically
2. **iOS**: Build IPA → Upload to TestFlight automatically

You can also trigger either workflow manually from the GitHub Actions tab.

---

## Immediate upload (skip CI for the first submission)

The files are already built and ready:

| File | Purpose |
|---|---|
| `RoundTable-release.aab` | Upload to Google Play Console directly |
| `RoundTable-debug.apk` | Install on any Android device for testing |
| `ios/App/` (Xcode project) | Open on Mac → Product → Archive → Upload |

Keystore password: `RoundTable2026!` — store this securely, you cannot re-sign the app with a different keystore.
