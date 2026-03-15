# ChordRepo

A chord sheet manager for musicians — built with React Native (Expo SDK 51), TypeScript, and Supabase. Manage songs, build setlist lineups, transpose keys, and adjust chord display size — all synced to the cloud.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 18 | [nodejs.org](https://nodejs.org) |
| npm | >= 8.3 | bundled with Node |
| EAS CLI | >= 10 | `npm install -g eas-cli` |
| Expo account | — | [expo.dev](https://expo.dev) |

## Local Development

### 1. Clone & install

```bash
git clone <repo-url>
cd chordrepo-app
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your real Supabase credentials
```

### 3. Start with Expo Go (JS changes only)

```bash
npm start
# Scan the QR code with the Expo Go app on your device
```

> **Limitation:** Expo Go is a sandbox and does not support all native modules. Use a dev client build (below) for full native feature parity.

### 4. Start with a development client (recommended)

A dev client is a custom native build that includes all production native modules but still supports hot reload.

```bash
# Build the dev client once (requires EAS setup — see below)
npm run build:dev:ios       # iOS Simulator
npm run build:dev:android   # Android

# Then start Metro pointing at the dev client
npm run start:dev-client
```

## Production Builds (EAS)

### First-time EAS setup

```bash
# Log in to Expo
eas login

# Link this project to your Expo account.
# This writes the real projectId and updates.url into app.json — commit that change.
npx eas project:init

# Set secrets so EAS can inject Supabase credentials at build time
# See docs/EAS_SECRETS.md for full details
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..."
```

> **Important:** `npx eas project:init` must be run before any build. It writes `extra.eas.projectId` and `updates.url` into `app.json`. Commit that change — without it `expo prebuild` will fail during the EAS build, causing a misleading ENOENT error on the signing injection step.

### Build commands

```bash
# Preview build — internal distribution (TestFlight / Firebase App Distribution)
npm run build:preview

# Production build — App Store / Play Store ready
npm run build:production

# Platform-specific
npm run build:production:ios
npm run build:production:android
```

Builds run in the EAS cloud. Monitor progress at [expo.dev/builds](https://expo.dev/builds).

### Submit to stores

```bash
npm run submit:ios        # Uploads to App Store Connect
npm run submit:android    # Uploads to Google Play
```

> Configure store credentials in `eas.json` under `"submit"` before running.

### OTA updates (no rebuild needed for JS-only changes)

```bash
npm run update
```

EAS Update pushes a new JS bundle to users. The `runtimeVersion` in `app.json` controls compatibility — only devices running the matching native binary will receive the update.

## Project Structure

```
chordrepo-app/
├── App.tsx                   # Root: fonts, splash, auth init
├── app.json                  # Expo / EAS config (runtimeVersion, updates, etc.)
├── eas.json                  # EAS Build profiles (development / preview / production)
├── metro.config.js           # Metro bundler config (required for native builds)
├── assets/
│   ├── icon.png              # App icon (1024×1024)
│   ├── splash.png            # Splash screen
│   └── adaptive-icon.png     # Android adaptive icon foreground
├── src/
│   ├── api/
│   │   ├── songs.ts          # CRUD + bulk import via Supabase client
│   │   ├── preferences.ts    # User transpose preferences
│   │   └── errors.ts         # Typed error helpers
│   ├── components/
│   │   ├── ChordSheet.tsx    # Renders bars + chords with transpose support
│   │   ├── SongCard.tsx      # List item for a song
│   │   ├── SongFormModal.tsx # Create / edit song modal
│   │   ├── TransposePicker.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── FAB.tsx           # Floating action button
│   ├── navigation/
│   │   ├── RootNavigator.tsx # Auth gate → Tab navigator
│   │   └── types.ts          # Navigation param list types
│   ├── screens/
│   │   ├── Auth/LoginScreen.tsx
│   │   ├── HomeScreen.tsx    # Setlist / lineup
│   │   ├── LibraryScreen.tsx # Paginated song browser
│   │   ├── SongDetailScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── store/
│   │   ├── authStore.ts      # Supabase auth + shared supabase client
│   │   ├── lineupStore.ts    # In-memory setlist (Zustand)
│   │   └── settingsStore.ts  # Chord font size (persisted)
│   ├── theme/index.ts        # Colors, typography, spacing, radii
│   └── types/index.ts        # Domain types mirroring Supabase schema
└── docs/
    ├── EAS_SECRETS.md        # How to configure EAS Secrets
    └── superpowers/plans/    # Implementation planning docs
```

## Architecture

- **Direct-to-Supabase** — No backend server. The Supabase JS client runs in-app; Row Level Security (RLS) policies enforce per-user data access.
- **Auth** — Supabase Auth (email/password) with session persistence via AsyncStorage. Guest mode provides read-only library access.
- **State** — Zustand for global state (auth, lineup, settings). Component-local state for UI.
- **Navigation** — React Navigation native stack + bottom tabs. Auth gate at the root level.
- **OTA updates** — `expo-updates` with `appVersion` runtime policy. JS-only changes deploy instantly; native changes require a new build.

## Environment Variables

| Variable | Where to set |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` (local) · EAS Secret (cloud) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env` (local) · EAS Secret (cloud) |

See `docs/EAS_SECRETS.md` for step-by-step setup.
