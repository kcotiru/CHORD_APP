-- ============================================================
-- Migration: initial schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS citext;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    username      CITEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Artists
CREATE TABLE IF NOT EXISTS artists (
    artist_id SERIAL PRIMARY KEY,
    name      VARCHAR(255) UNIQUE NOT NULL,
    slug      CITEXT UNIQUE NOT NULL
);

-- 3. Songs
CREATE TABLE IF NOT EXISTS songs (
    song_id    SERIAL PRIMARY KEY,
    artist_id  INTEGER REFERENCES artists(artist_id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    slug       CITEXT NOT NULL,
    content    TEXT NOT NULL,
    root_key   VARCHAR(10) NOT NULL,
    bpm        INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_root_key CHECK (root_key ~ '^[A-G][#b]?$')
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_songs_title   ON songs   USING btree (title);
CREATE INDEX IF NOT EXISTS idx_songs_slug    ON songs   USING btree (slug);
CREATE INDEX IF NOT EXISTS idx_artists_slug  ON artists USING btree (slug);

-- 5. updated_at trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Apply trigger
DROP TRIGGER IF EXISTS trg_update_song_timestamp ON songs;
CREATE TRIGGER trg_update_song_timestamp
BEFORE UPDATE ON songs
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
