-- ============================================================================
-- RPC: bulk_import_sections
-- ----------------------------------------------------------------------------
-- Atomically inserts a nested structure of sections + bars for a given song.
-- All inserts succeed together or none do (full ROLLBACK on any error).
--
-- Call from API:
--   supabase.rpc('bulk_import_sections', {
--     p_song_id:  '<uuid>',
--     p_owner_id: '<uuid>',
--     p_sections: '[{"name":"Verse","order_index":0,"bars":[...]}]'
--   })
--
-- Run this in Supabase Dashboard → SQL Editor, or via the CLI:
--   supabase db push  (if tracked in supabase/migrations/)
-- ============================================================================

CREATE OR REPLACE FUNCTION bulk_import_sections(
    p_song_id  UUID,
    p_owner_id UUID,
    p_sections JSONB          -- JSON array of section objects
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER               -- runs as the function owner (bypasses RLS)
SET search_path = public
AS $$
DECLARE
    v_section      JSONB;
    v_bar          JSONB;
    v_section_id   UUID;
BEGIN
    -- Validate ownership before touching any data
    IF NOT EXISTS (
        SELECT 1 FROM songs
        WHERE id = p_song_id
          AND owner_id = p_owner_id
    ) THEN
        RAISE EXCEPTION 'Song not found or permission denied'
            USING ERRCODE = 'P0001';
    END IF;

    -- Iterate over each section in the JSON array
    FOR v_section IN SELECT * FROM jsonb_array_elements(p_sections)
    LOOP
        -- Insert section, capture generated id
        INSERT INTO sections (song_id, owner_id, name, order_index)
        VALUES (
            p_song_id,
            p_owner_id,
            v_section->>'name',
            (v_section->>'order_index')::INTEGER
        )
        RETURNING id INTO v_section_id;

        -- Insert each bar belonging to this section
        FOR v_bar IN SELECT * FROM jsonb_array_elements(v_section->'bars')
        LOOP
            INSERT INTO bars (
                section_id,
                song_id,
                owner_id,
                bar_order,
                chords,
                repeat_count,
                starts_new_line
            )
            VALUES (
                v_section_id,
                p_song_id,
                p_owner_id,
                (v_bar->>'bar_order')::INTEGER,
                -- Convert JSON array of strings to TEXT[]
                CASE
                    WHEN v_bar->'chords' IS NOT NULL AND jsonb_typeof(v_bar->'chords') = 'array'
                    THEN ARRAY(SELECT jsonb_array_elements_text(v_bar->'chords'))
                    ELSE NULL
                END,
                COALESCE((v_bar->>'repeat_count')::INTEGER, 1),
                COALESCE((v_bar->>'starts_new_line')::BOOLEAN, FALSE)
            );
        END LOOP;
    END LOOP;

    -- touch_parent_song trigger fires automatically via the sections/bars inserts
END;
$$;

-- Grant execute to authenticated users (the function enforces ownership internally)
GRANT EXECUTE ON FUNCTION bulk_import_sections(UUID, UUID, JSONB) TO authenticated;


-- ============================================================================
-- RPC: shift_section_order_indices
-- ----------------------------------------------------------------------------
-- Shifts order_index by p_delta for all sections of a song whose order_index
-- falls within [p_from, p_to] (inclusive).
--
-- Used by PATCH /sections/:id/position to make room for a moving section.
-- The DEFERRABLE constraint means mid-sequence duplicates are tolerated
-- within the same transaction; this function is safe to call from application
-- code as well since the shifts always produce a valid final state.
-- ============================================================================

CREATE OR REPLACE FUNCTION shift_section_order_indices(
    p_song_id UUID,
    p_from    INTEGER,
    p_to      INTEGER,
    p_delta   INTEGER          -- +1 or -1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE sections
    SET    order_index = order_index + p_delta
    WHERE  song_id     = p_song_id
      AND  order_index BETWEEN p_from AND p_to;
END;
$$;

GRANT EXECUTE ON FUNCTION shift_section_order_indices(UUID, INTEGER, INTEGER, INTEGER) TO authenticated;
