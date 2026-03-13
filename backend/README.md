# backend

A Node/Express/TypeScript REST API for managing chord chart songs with built-in parsing and transposing.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 4
- **Database**: PostgreSQL (via `pg` pool)
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Security**: Helmet, CORS, bcrypt

---

## Setup

```bash
cp .env.example .env        # fill in your values
npm install
psql -d your_db -f migrations/001_initial_schema.sql
npm run dev
```

---

## Project Structure

```
src/
├── app.ts                    # Entry point
├── config/
│   └── database.ts           # pg Pool + connectDB()
├── controllers/              # HTTP layer
├── services/                 # Business logic
├── repositories/             # SQL queries
├── routes/                   # Route definitions
├── middleware/               # auth, validation, error handler
├── utils/
│   ├── chord.utils.ts        # Parser + Transposer
│   ├── errors.ts             # Custom AppError classes
│   ├── response.ts           # ApiResponse helpers
│   └── validation.ts         # Zod schemas
└── types/
    └── index.ts              # Shared TS interfaces
```

---

## API Reference

### Auth

| Method | Path               | Body                          | Auth | Description              |
|--------|--------------------|-------------------------------|------|--------------------------|
| POST   | /api/auth/register | `{ username, password }`      | –    | Register new user        |
| POST   | /api/auth/login    | `{ username, password }`      | –    | Login → tokens           |
| POST   | /api/auth/refresh  | `{ refreshToken }`            | –    | Refresh access token     |

### Artists

| Method | Path              | Auth     | Description              |
|--------|-------------------|----------|--------------------------|
| GET    | /api/artists      | –        | List all (paginated)     |
| GET    | /api/artists/:slug| –        | Get by slug              |
| POST   | /api/artists      | Bearer   | Create artist            |
| PATCH  | /api/artists/:id  | Bearer   | Update artist            |
| DELETE | /api/artists/:id  | Bearer   | Delete (cascades songs)  |

### Songs

| Method | Path                         | Auth              | Description                          |
|--------|------------------------------|-------------------|--------------------------------------|
| GET    | /api/songs                   | –                 | List all (paginated, `?search=`)     |
| GET    | /api/songs/:id               | –                 | Get by ID                            |
| GET    | /api/songs/by-slug/:slug     | –                 | Get by slug                          |
| GET    | /api/songs/by-artist/:id     | –                 | Songs for an artist                  |
| POST   | /api/songs                   | Bearer            | Create song                          |
| PATCH  | /api/songs/:id               | Bearer            | Update song                          |
| DELETE | /api/songs/:id               | Bearer            | Delete song                          |
| GET    | /api/songs/:id/parse         | –                 | Parse content → ContentBlocks        |
| POST   | /api/songs/:id/transpose     | Bearer (if save)  | Transpose chord chart                |

---

## Chord Chart System

### Content Format

```
[Intro]
| G | C |
[Verse 1]
| G | D | Em | C |
[Chorus]
| C | G | Am | F |
```

### `GET /api/songs/:id/parse`

Returns typed `ContentBlock[]` for UI rendering:

```json
{
  "status": "success",
  "data": {
    "song": { "song_id": 1, "title": "Example", "root_key": "G", ... },
    "blocks": [
      { "type": "section_header", "raw_text": "[Intro]" },
      { "type": "chord_line",     "raw_text": "| G | C |" },
      { "type": "section_header", "raw_text": "[Verse 1]" },
      { "type": "chord_line",     "raw_text": "| G | D | Em | C |" }
    ]
  }
}
```

### `POST /api/songs/:id/transpose`

```json
{
  "semitones": 2,
  "preference": "sharp",
  "save": false
}
```

| Field       | Type    | Required | Default | Notes                              |
|-------------|---------|----------|---------|------------------------------------|
| semitones   | int     | ✅        | –       | -11 to 11                          |
| preference  | string  | –        | "sharp" | `"sharp"` or `"flat"`              |
| save        | boolean | –        | false   | Persist to DB (requires Bearer)    |

**Response:**

```json
{
  "status": "success",
  "data": {
    "song": { ... },
    "newRootKey": "A",
    "blocks": [
      { "type": "section_header", "raw_text": "[Intro]" },
      { "type": "chord_line",     "raw_text": "| A | D |" }
    ]
  }
}
```

### UI Rendering Suggestion (React/HTML)

```tsx
{blocks.map((block, i) =>
  block.type === 'section_header' ? (
    <h3 key={i} style={{ fontWeight: 'bold', marginTop: '1rem' }}>
      {block.raw_text}
    </h3>
  ) : (
    <pre key={i} style={{ fontFamily: 'monospace', margin: 0 }}>
      {block.raw_text}
    </pre>
  )
)}
```

---

## Enharmonic Equivalents

When transposing, the API selects between `#` and `b` spellings based on `preference`:

| Semitone index | sharp | flat |
|----------------|-------|------|
| 1              | C#    | Db   |
| 3              | D#    | Eb   |
| 6              | F#    | Gb   |
| 8              | G#    | Ab   |
| 10             | A#    | Bb   |

---

## Error Format

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "root_key": ["root_key must be a valid musical note (e.g. C, F#, Bb)"]
  }
}
```
