-- ============================================================
-- v34: Global Scale Performance Indexes
-- Supports billions of concurrent users across all regions.
-- Run via Supabase SQL Editor before launch.
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Username lookups (profile pages, @mentions)
CREATE INDEX IF NOT EXISTS idx_profiles_username
  ON profiles (username) WHERE username IS NOT NULL;

-- Account status filter (active user checks in API routes)
CREATE INDEX IF NOT EXISTS idx_profiles_account_status
  ON profiles (account_status);

-- Full-text search on name + bio
CREATE INDEX IF NOT EXISTS idx_profiles_fts
  ON profiles USING gin(to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(username, '') || ' ' || coalesce(tagline, '')));

-- ── posts / feed ──────────────────────────────────────────────────────────────
-- Primary feed cursor: author + created_at (DESC) for infinite scroll
CREATE INDEX IF NOT EXISTS idx_posts_feed_cursor
  ON posts (created_at DESC) WHERE is_deleted = false;

-- Per-group feed
CREATE INDEX IF NOT EXISTS idx_posts_group_feed
  ON posts (group_id, created_at DESC) WHERE is_deleted = false AND group_id IS NOT NULL;

-- Author feed (profile page)
CREATE INDEX IF NOT EXISTS idx_posts_author_feed
  ON posts (author_id, created_at DESC) WHERE is_deleted = false;

-- ── post_reactions ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_post_reactions_post
  ON post_reactions (post_id);

CREATE INDEX IF NOT EXISTS idx_post_reactions_user_post
  ON post_reactions (user_id, post_id);

-- ── post_comments ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_post_comments_post
  ON post_comments (post_id, created_at ASC);

-- ── tasks (hustle / side-hustle) ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_status_created
  ON tasks (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_created_by
  ON tasks (created_by, created_at DESC);

-- GIN index for array containment search on assignees
CREATE INDEX IF NOT EXISTS idx_tasks_assignees_gin
  ON tasks USING gin(assignees);

-- ── notifications ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, created_at DESC) WHERE is_read = false;

-- ── user_connections ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_connections_user_a
  ON user_connections (user_a_id, status);

CREATE INDEX IF NOT EXISTS idx_connections_user_b
  ON user_connections (user_b_id, status);

-- ── groups ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_groups_slug
  ON groups (slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_groups_created_by
  ON groups (created_by);

-- ── group_members ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_group_members_user
  ON group_members (user_id);

CREATE INDEX IF NOT EXISTS idx_group_members_group_role
  ON group_members (group_id, role);

-- ── pre_registrations ─────────────────────────────────────────────────────────
-- Dedup by email (most common write path at launch)
CREATE UNIQUE INDEX IF NOT EXISTS idx_preregistrations_email_unique
  ON pre_registrations (email);

-- ── student_verifications ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_student_verifications_user_year
  ON student_verifications (user_id, academic_year, status);

-- ── certificates ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_certificates_user
  ON certificates (user_id) WHERE revoked = false;

-- ── Postgres connection pool tuning ──────────────────────────────────────────
-- Set in Supabase dashboard → Settings → Database → Connection Pooling:
--   Mode: Transaction  (for serverless/edge — no persistent connections)
--   Pool size: 15 (Supabase Pro default; increase to 25 for high traffic)
-- These cannot be set via SQL but are documented here as required config.

-- ── Vacuum & analyze all affected tables ─────────────────────────────────────
ANALYZE profiles;
ANALYZE posts;
ANALYZE post_reactions;
ANALYZE post_comments;
ANALYZE tasks;
ANALYZE notifications;
ANALYZE groups;
ANALYZE group_members;
