# JournalApp — dev run (2026-10-18)

## Web dev server

```bash
cd ~/Desktop/Calculator/Web_Calculator
# deps already present (node_modules)
SESSION_NAME="web-calculator-dev"
tmux has-session -t "=$SESSION_NAME" 2>/dev/null || \
  tmux new-session -d -s "$SESSION_NAME" -c "$PWD" -- "${SHELL:-zsh}" -l -c 'npm run dev'
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/
```

- **URL:** http://127.0.0.1:5173/
- **tmux session:** `web-calculator-dev`
- **Attach:** `tmux attach-session -t web-calculator-dev`

## JournalApp (iOS)

- **Project:** `~/Desktop/Calculator/ios/JournalApp/JournalApp.xcodeproj`
- **Bundle ID:** `com.stevengord.journalsplit`
- **Dev URL (Info.plist `JournalURL`):** `http://127.0.0.1:5173/`
- **ATS:** `NSAllowsLocalNetworking` = true (HTTP localhost for WKWebView)

### Build & run (simulator)

```bash
SIM_ID="5035302D-E854-45A1-92F9-9F2E92B9309F"  # iPhone 17e, iOS 27.0
DERIVED="/tmp/JournalApp-build"
xcodebuild -project ~/Desktop/Calculator/ios/JournalApp/JournalApp.xcodeproj \
  -scheme JournalApp \
  -destination "platform=iOS Simulator,id=$SIM_ID" \
  -derivedDataPath "$DERIVED" build
xcrun simctl install "$SIM_ID" "$DERIVED/Build/Products/Debug-iphonesimulator/JournalApp.app"
xcrun simctl launch "$SIM_ID" com.stevengord.journalsplit
```

**Smoke result:** BUILD SUCCEEDED, app launched on iPhone 17e simulator; auth screen loads from local Vite.

Connected device also available: `iPhone Steve Gordiyenko` (use `-destination 'platform=iOS,name=iPhone Steve Gordiyenko'`).

## App icon (distinct from Swith)

| App | Icon |
|-----|------|
| **Swith / Periodization** | Green «8 недель» squircle (unchanged) |
| **JournalApp** | Gold line chart on dark background |

- **Source:** project store `media/e42514da-951f-4a7d-9dfc-2350ce28582b.png` (not the glow variant `e5d97872-…`)
- **Target:** `JournalApp/Assets.xcassets/AppIcon.appiconset/` — 1024 + iPhone 20/29/40/60 @2x/@3x, `Contents.json` updated

## English keyboard

### iOS (JournalApp)

- `Info.plist`: `CFBundleLocalizations` → `en`, `ru` (no keyboard restriction keys)
- WKWebView: default config; no `keyboard` locks in native code

### Web (minimal patch)

- `AuthScreen.tsx`: `lang="en"` on username + password fields (login/register)
- `JournalSessionEditor.tsx`: `lang="en"` on session note input (+ normal autocorrect/spellcheck)

`index.html` stays `lang="ru"` for UI copy; field-level `lang="en"` tells iOS to prefer Latin keyboard in those fields.

### Switch keyboard on iPhone / Simulator

1. **Settings → General → Keyboard → Keyboards → Add New Keyboard… → English**
2. In any text field: tap **globe** (🌐) bottom-left of keyboard to cycle layouts (Russian ↔ English)

## Screenshot

- `media/journalapp-simulator-preview.png` — simulator after launch (login screen from dev server)

- **Restart OK:** 2026-10-18 16:30 (+05) — tmux `web-calculator-dev`, Vite :5173 → 200, sim iPhone 17e `5035302D-E854-45A1-92F9-9F2E92B9309F`, BUILD SUCCEEDED, экран входа из dev-сервера.

## Troubleshooting: «вижу только Периодизация» (2026-10-18 16:34 +05)

**Симптом:** на домашнем экране iPhone 17 (iOS 26.3) есть **Периодизация** (Swith), но нет web-native оболочки с золотым графиком.

**Причина:** JournalApp **не был установлен** на симулятор `FE1D42E4-0042-412E-8B2A-C02334042F21` (раньше сборка ставилась только на iPhone **17e** `5035302D-…`, iOS 27.0). На скриншоте пользователя — именно **iPhone 17**, не 17e.

| | **Периодизация (Swith)** | **JournalApp (web shell)** |
|---|---|---|
| **Подпись на Home** | Периодизация | **Трен. калькулятор** (было «Журнал») |
| **Bundle ID** | `com.stevegordiyenko.periodization.light` | `com.stevengord.journalsplit` |
| **Иконка** | зелёный «8 недель» | золотой line chart |
| **Product name** | Periodization | JournalApp |

**CFBundleDisplayName:** `Трен. калькулятор` в `JournalApp/Info.plist` — коротко и не путается с «Периодизация».

**Целевой sim (booted, iOS 26.3):** `FE1D42E4-0042-412E-8B2A-C02334042F21` — iPhone 17.

```bash
SIM_ID="FE1D42E4-0042-412E-8B2A-C02334042F21"
DERIVED="/tmp/JournalAppDerived"
xcodebuild -project ~/Desktop/Calculator/ios/JournalApp/JournalApp.xcodeproj \
  -scheme JournalApp -destination "platform=iOS Simulator,id=$SIM_ID" \
  -derivedDataPath "$DERIVED" build
xcrun simctl install "$SIM_ID" "$DERIVED/Build/Products/Debug-iphonesimulator/JournalApp.app"
xcrun simctl launch "$SIM_ID" com.stevengord.journalsplit
```

**Dev:** tmux `web-calculator-dev`, `curl http://127.0.0.1:5173/` → **200**.

**Скрины (project store):** `media/journalapp-home-visible.png` (оба значка на Home), `media/journalapp-simulator-preview.png` (экран входа).
