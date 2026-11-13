# Kural Daily: notes for Claude

Read this first. The README, CONTRIBUTING.md and `docs/` (design, testing, releasing) give the
full picture; this file holds the decisions and loose ends that aren't obvious from the code.

## The project

- Thirukkural app: Expo SDK 54, React Native 0.81, TypeScript, expo-router, React Native Paper
  (MD3), zustand + AsyncStorage, Reanimated, react-native-svg, Jest.
- Published by **Aatra Labs** (owner: Niranjan Rajkumar). Contact: aatralabs@gmail.com.
- Live on Google Play (`com.aatralabs.kuraldaily`); GitHub releases carry the APK. Repo
  `github.com/aatralabs/kural-daily` (public), default branch `master`.
- Package ID, Expo owner `aatralabs` and the EAS projectId in `app.json` are fixed. Don't change them.
- License: GPL-3.0-or-later. The name "Kural Daily" and the icon are reserved; forks must rename.
  Paid features may come later, so keep code ownership clear (no copying code from
  incompatibly licensed projects).
- Offline and private: no accounts, analytics, tracking, crash reporting or network calls. Any
  change to what's stored or collected must update `PRIVACY.md` and You → Privacy policy in
  `app/(tabs)/profile.tsx` together.

## Working rules

- The owner wants to know about every change: work on a branch, open a PR, merge only when asked.
- `npm run check` (typecheck, lint, tests) must pass before every push. CI runs the same.
- Follow `docs/design.md`: the couplet dominates, plain rows over cards, colour by role, no
  hard-coded colours (use `theme/`), no shadows or gradients, motion only for state changes.
- "Done" and "right" use the accent; "wrong" is neutral grey. No success green or warning yellow.
  `flame` is for the streak fire icon only. The word for the explanation is "meaning" (பொருள்).
- Bundled fonts: set `fontFamily` only, never with a bold `fontWeight`.
- Changing the persisted settings shape: bump `version` in `store/useSettingsStore.ts` (now 4)
  and add a step to `migrateSettings`, with a test.
- UI text is plain and human ("Read today's Kural to keep it going"), not marketing copy.
- Anything that touches release builds (R8 rules, native config) needs a phone test of a
  preview build before merging: R8 problems only show in release builds.

## Decisions and why

- **Daily Kural** (`services/DailyService.ts`): a fixed seeded shuffle of all 1330, indexed by
  days since 2024-01-01. Same Kural for everyone on a day, no repeat until all have been shown,
  never two from the same chapter in a row. Changing the seed or epoch changes everyone's Kural.
- **When a Kural counts as read** (`hooks/useReadTracker.ts`): after 6 s on screen with the app
  in front, or at once on any interaction (listen, meaning, learn, save, share).
- **Text size**: default follows the phone's font scale (`DEVICE_TEXT_SIZE = 0`); S–XL are fixed.
  The couplet is always the largest reading text; `FitLines` keeps each line on one line.
- **Defaults**: text size = device, page = Auto, accent = Indigo, voice = best available,
  font = device, **bold couplet on**.
- **Hidden words** in Learn use the Telegram-style particle spoiler (`components/ui/Spoiler.tsx`).
  The owner loves it; keep it.
- **Large screens**: phones stay portrait (`hooks/usePhonePortraitLock.ts`, shortest side < 600dp);
  tablets and foldables rotate, with content in a centred `READING_WIDTH` (720) column.
- **Kural data**: `assets/data/thirukkural.json` is cleaned by `scripts/cleanText.js` (spaces,
  quotes, footnotes, zero-width characters); a test in `DataService.test.ts` guards it.
- **Release builds**: R8 minify and resource shrinking (`expo-build-properties`) with the
  optimizing rules (`plugins/withOptimizedR8.js`).

## Releasing (see `docs/releasing.md`)

- Version in `app.json` and `package.json`; CHANGELOG section per release.
- EAS `production` builds bump `android.versionCode` locally: commit it after every build, or the
  next upload reuses a number Play has seen.
- Play App Signing uses Google's key. The APK for GitHub and Galaxy Store must be the **signed
  universal APK from Play's App bundle explorer**, never an EAS build, so all installs share a key.

## Open items

- Play Console notice about deprecated edge-to-edge APIs comes from React Native, react-native-screens
  and Material components; it clears with a future Expo SDK update. The BitmapFactory notice is
  library code too.
- Trader status (EU) in Play Console: the owner's decision.
- Bundled Tamil/English explanations and translations (`assets/data`) belong to their authors.
  Before any paid version, confirm the rights to use them commercially or replace them.
- 3-button navigation bar: a fix for content sitting too low went in; confirm on a 3-button phone.
- Galaxy Store listing, if still wanted (same Play-signed APK and listing).
