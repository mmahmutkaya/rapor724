-- Migration 003: Add 'draft' to measurement_lines status check constraint
-- Run this in Supabase SQL Editor

ALTER TABLE measurement_lines DROP CONSTRAINT IF EXISTS measurement_lines_status_check;

ALTER TABLE measurement_lines
  ADD CONSTRAINT measurement_lines_status_check
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'ignored'));

ALTER TABLE measurement_lines
  ALTER COLUMN status SET DEFAULT 'draft';
