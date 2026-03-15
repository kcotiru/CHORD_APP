# EAS Secrets Setup

ChordRepo uses two environment variables that must be set as EAS Secrets before building.

## One-time setup (per Expo account)

```bash
# Install EAS CLI globally if not already installed
npm install -g eas-cli

# Log in to your Expo account
eas login

# Set secrets (run once; values are stored securely in EAS — never in git)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project-ref.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key-here"
```

## Verify secrets are set

```bash
eas secret:list
```

## Local development

For local development (Expo Go or dev client), create a `.env` file at the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

`.env` is gitignored — never commit real credentials.

## How it works

| Context           | Source of env vars                              |
|-------------------|-------------------------------------------------|
| Local / Expo Go   | `.env` file read by Expo's Metro bundler        |
| EAS Build (cloud) | EAS Secrets injected at build time              |
| OTA Update        | Baked into the JS bundle at build time          |

The `EXPO_PUBLIC_` prefix makes them available in JS via `process.env.EXPO_PUBLIC_*`.
