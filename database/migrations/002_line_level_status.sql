-- ============================================================
-- Migration 002: Satır Düzeyinde Onay Durumu
-- ============================================================
-- Kart Mimarisini desteklemek için measurement_lines tablosuna
-- bireysel satır onay takibi ekleniyor.
--
-- Kart Mimarisi (CLAUDE.md):
--   Kişi Kartları  → pending / rejected / ignored satırlar
--   Onay Kartı     → approved satırlar + revize ağacı
-- ============================================================


-- 1. measurement_lines: satır düzeyinde durum ve onaylayan
ALTER TABLE measurement_lines
  ADD COLUMN IF NOT EXISTS status      text        NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- parent_line_id (daha önce ayrı migration ile eklenmiş olabilir)
ALTER TABLE measurement_lines
  ADD COLUMN IF NOT EXISTS parent_line_id uuid REFERENCES measurement_lines(id);

-- Durum constraint (IF NOT EXISTS için DO bloğu)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND constraint_name   = 'measurement_lines_status_check'
  ) THEN
    ALTER TABLE measurement_lines
      ADD CONSTRAINT measurement_lines_status_check
        CHECK (status IN ('pending', 'approved', 'rejected', 'ignored'));
  END IF;
END
$$;


-- 2. measurement_sessions: revision_snapshot + genişletilmiş status
ALTER TABLE measurement_sessions
  ADD COLUMN IF NOT EXISTS revision_snapshot jsonb;

-- Mevcut status kısıtını kaldır ve tüm kullanılan değerleri içerecek şekilde yeniden oluştur
ALTER TABLE measurement_sessions
  DROP CONSTRAINT IF EXISTS measurement_sessions_status_check;

ALTER TABLE measurement_sessions
  ADD CONSTRAINT measurement_sessions_status_check
    CHECK (status IN (
      'draft', 'ready', 'seen', 'approved', 'revised',
      'rejected', 'revise_requested', 'ignored'
    ));


-- 3. Performans için index'ler
CREATE INDEX IF NOT EXISTS idx_ml_status        ON measurement_lines(status);
CREATE INDEX IF NOT EXISTS idx_ml_parent        ON measurement_lines(parent_line_id);
CREATE INDEX IF NOT EXISTS idx_ml_approved_by   ON measurement_lines(approved_by);


-- 4. Mevcut veri migrasyonu
--    Daha önce onaylanmış session'lardaki kök satırlar (parent yok) approved'a çekilir.
UPDATE measurement_lines ml
SET    status = 'approved'
FROM   measurement_sessions ms
WHERE  ml.session_id      = ms.id
  AND  ms.status          IN ('approved', 'revised')
  AND  ml.parent_line_id  IS NULL
  AND  ml.status          = 'pending';
