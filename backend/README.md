# 🎵 ChordRepo API

Production-ready REST API for ChordRepo — built with **Node.js**, **Express**, **TypeScript**, and **Supabase**.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Supabase project | Any plan |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

> Keys are found in **Supabase Dashboard → Project Settings → API**.

### 3. Apply the database schema

Run the original schema first (from `chordrepo.sql`), then apply the RPC functions:

```bash
# In Supabase Dashboard → SQL Editor, paste and run:
# 1. chordrepo.sql           (tables, triggers, RLS)
# 2. supabase/bulk_import_sections.sql   (RPC functions)
```

Or via Supabase CLI:

```bash
supabase db reset  # if using local dev
```

### 4. Run in development

```bash
npm run dev
```

---

## Architecture

```
src/
├── config/
│   ├── env.ts              # Zod-validated env vars — app exits on bad config
│   └── supabase.ts         # Admin client + per-request user-scoped client factory
├── types/
│   ├── database.types.ts   # Raw DB entity types (mirrors SQL schema 1-to-1)
│   └── api.types.ts        # Zod schemas + inferred DTO types
├── middleware/
│   ├── auth.middleware.ts  # JWT extraction → user-scoped Supabase client on req
│   └── error.middleware.ts # Global error handler + PG error code mapper
├── utils/
│   ├── errors.ts           # AppError hierarchy + Postgres error mapper
│   └── response.ts         # Typed ApiResponse helpers
├── services/               # Business logic — receive/return typed objects
├── controllers/            # HTTP layer — parse request, call service, send response
├── routes/                 # Route definitions (services instantiated per-request)
├── app.ts                  # Express app (middleware + routes, no listen)
└── server.ts               # listen() + graceful shutdown
supabase/
└── bulk_import_sections.sql  # Transactional RPC functions
```

### Key design decisions

**Per-request Supabase client** — `authenticate` middleware creates a `createClient()` instance for every request, passing the user's JWT in the `Authorization` header. This means Supabase evaluates `auth.uid()` correctly for every query, so all RLS policies (`owner_id = auth.uid()`) are enforced automatically — no manual user-id filtering needed in most queries.

**Zod as single source of truth** — every DTO is defined as a Zod schema; TypeScript types are inferred from it. Validation happens in controllers before the service layer is touched.

**PostgreSQL error mapping** — the global error handler checks `error.code` against known PG error codes (`23514` check violation, `23505` unique violation, etc.) and returns clean 400-level responses with the constraint name and detail.

---

## API Reference

All endpoints require `Authorization: Bearer <supabase-jwt>`.

### Songs

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/songs` | List songs with filters + pagination |
| `POST` | `/songs` | Create a song |
| `GET` | `/songs/:id/full` | Song + sections + bars + user preference |
| `PATCH` | `/songs/:id` | Update song fields |
| `DELETE` | `/songs/:id` | Delete a song (owner only) |

#### `GET /songs` — Query params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | — | Case-insensitive partial match |
| `artist` | string | — | Case-insensitive partial match |
| `limit` | number | `20` | Max 100 |
| `offset` | number | `0` | Pagination offset |

**Response**

```json
{
  "status": "success",
  "data": [ ...songs ],
  "pagination": { "limit": 20, "offset": 0, "total": 142 }
}
```

#### `GET /songs/:id/full` — Response shape

```json
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "Blackbird",
    "artist": "The Beatles",
    "original_key": "G",
    "bpm": 96,
    "sections": [
      {
        "id": "...",
        "name": "Verse",
        "order_index": 0,
        "bars": [
          { "bar_order": 0, "chords": ["G", "Am7"], "repeat_count": 1, "starts_new_line": false }
        ]
      }
    ],
    "user_preference": {
      "transposed_key": "F",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

> `user_preference` is `null` when the authenticated user has no saved transposition.

---

### Sections

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/songs/:id/sections/bulk` | Atomic bulk import of sections + bars |
| `PATCH` | `/sections/:id/position` | Reorder a section |

#### `POST /songs/:id/sections/bulk` — Body

```json
{
  "sections": [
    {
      "name": "Verse",
      "order_index": 0,
      "bars": [
        {
          "bar_order": 0,
          "chords": ["G", "Em"],
          "repeat_count": 2,
          "starts_new_line": false
        }
      ]
    },
    {
      "name": "Chorus",
      "order_index": 1,
      "bars": []
    }
  ]
}
```

All sections and bars are inserted atomically — any failure rolls back the entire import.

#### `PATCH /sections/:id/position` — Body

```json
{ "new_order_index": 2 }
```

Shifts all sections between the old and new position by ±1, then places the section at `new_order_index`. Works correctly in both directions (moving up or down).

---

### Transpose / Preferences

| Method | Path | Description |
|--------|------|-------------|
| `PUT` | `/songs/:id/transpose` | Upsert transposed key preference |
| `DELETE` | `/songs/:id/transpose` | Remove preference |

#### `PUT /songs/:id/transpose` — Body

```json
{ "transposed_key": "Bbm" }
```

Accepts loose formats (e.g. `"bbmin"`, `"c#"`) — the DB trigger normalises them automatically. Returns the stored (normalised) preference.

---

## Error Response Format

```json
{
  "status": "error",
  "message": "Duplicate value on uq_user_song_pref: Key (user_id, song_id)=(...) already exists.",
  "code": "CONFLICT",
  "errors": { ... }   // only present for validation errors (Zod field errors)
}
```

### HTTP Status Codes

| Code | When |
|------|------|
| `400` | Validation failure, DB check constraint violated |
| `401` | Missing/invalid/expired JWT |
| `403` | Authenticated but not the owner |
| `404` | Resource not found |
| `409` | Unique constraint violation |
| `500` | Unexpected server error |

---

## Build for Production

```bash
npm run build    # compiles TS → dist/
npm start        # runs dist/server.js
```
