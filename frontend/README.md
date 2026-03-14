# 🎵 ChordRepo — React Native App

Stage-ready chord sheet viewer built with **Expo**, **React Navigation**, and **Zustand**.

---

## Prerequisites

| Tool        | Version  |
|-------------|----------|
| Node.js     | ≥ 18     |
| Expo CLI    | latest   |
| iOS/Android | Expo Go or bare workflow |

---

## Setup

```bash
# 1. Install
cd chordrepo-app
npm install

# 2. Configure environment
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_API_URL

# 3. Start
npx expo start
```

> **On a physical device** — update `EXPO_PUBLIC_API_URL` in `.env` to your
> machine's LAN IP (e.g. `http://192.168.1.42:3000`) so the device can
> reach the Express API.

---

## Architecture

```
src/
├── api/
│   ├── client.ts           ← Fetch wrapper — auto-injects JWT from authStore
│   ├── songs.ts            ← All /songs endpoints
│   └── preferences.ts      ← PUT/DELETE /songs/:id/transpose
├── components/
│   ├── ChordSheet.tsx      ← Section + bar + chord token renderer
│   ├── ConfirmDialog.tsx   ← Destructive action modal
│   ├── FAB.tsx             ← Floating action button
│   ├── SongCard.tsx        ← Reusable song list row
│   ├── SongFormModal.tsx   ← Create/edit metadata bottom sheet
│   └── TransposePicker.tsx ← Horizontal key selector
├── navigation/
│   ├── RootNavigator.tsx   ← Auth gate → Tab → stacks
│   └── types.ts            ← Typed route params
├── screens/
│   ├── Auth/LoginScreen.tsx
│   ├── HomeScreen.tsx      ← The Lineup
│   ├── LibraryScreen.tsx   ← Searchable song list
│   ├── SongDetailScreen.tsx← Lead sheet + transpose + owner actions
│   └── SettingsScreen.tsx  ← Font size slider, account
├── store/
│   ├── authStore.ts        ← Supabase auth, JWT, guest mode (Zustand)
│   ├── lineupStore.ts      ← Ordered lineup (persisted AsyncStorage)
│   └── settingsStore.ts    ← Font size (persisted AsyncStorage)
└── theme/
    └── index.ts            ← All design tokens (Stage Lights dark theme)
```

---

## Design System — Stage Lights 🎭

| Token        | Value     | Usage                            |
|--------------|-----------|----------------------------------|
| `background` | `#080B0F` | Stage black — root background    |
| `chord`      | `#F0C040` | Amber — chord symbols, primary   |
| `section`    | `#4ECDC4` | Teal — section labels            |
| `surface`    | `#0F1419` | Cards, inputs                    |
| `textPrimary`| `#F0EDE8` | Warm off-white body text         |

**Fonts:** `SpaceMono` for chords (monospace alignment), `DM Sans` for all UI chrome.

---

## Screens

### The Lineup (`HomeScreen`)
- Curated ordered list persisted to device storage
- **Add to Lineup** modal: searches the API, tap to add/remove
- **New Song FAB**: opens `SongFormModal` (auth only)

### Library (`LibraryScreen`)
- Paginated list from `GET /songs`
- Debounced search by name or artist (toggle filter)
- Infinite scroll (25 items/page)
- **New Song FAB** (auth only)

### Song Detail (`SongDetailScreen`)
- Metadata: title, artist, key badge, BPM, time signature
- `ChordSheet` — renders every section → bar → chord, driven by `chordFontSize` from settings store
- `TransposePicker` — horizontal key picker; calls `PUT /songs/:id/transpose`; resets call `DELETE`
- **Bookmark** icon: add/remove from lineup
- **Edit / Delete** icons: visible only to the song's owner (auth.uid === owner_id)

### Settings (`SettingsScreen`)
- Live chord size slider (14–32 pt) with real-time preview
- Account card: email, guest indicator, sign-out

---

## Auth Flow

```
App launch
  ↓
initialize() — restores Supabase session from storage
  ↓
isInApp? (isAuthenticated || isGuest)
  ├── YES → TabNavigator
  └── NO  → LoginScreen
              ├── Sign In / Sign Up → Supabase Auth
              └── Continue as Guest → guest mode (read-only)
```

`canEdit` (`= isAuthenticated && !isGuest`) gates all write UI:
FABs, Edit/Delete icons, TransposePicker.

---

## Note on `@react-native-community/slider`

`SettingsScreen` imports `Slider` from `@react-native-community/slider`.
Add it to your project:

```bash
npx expo install @react-native-community/slider
```
