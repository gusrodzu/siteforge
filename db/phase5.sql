-- v0.8: reusable, site-scoped design patterns. Copies are independent by design.
CREATE TABLE IF NOT EXISTS site_patterns (
 id UUID PRIMARY KEY,
 site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
 name VARCHAR(120) NOT NULL,
 category VARCHAR(40) NOT NULL DEFAULT 'personalizados',
 content JSONB NOT NULL,
 created_by UUID NOT NULL REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_site_patterns_site ON site_patterns(site_id,created_at DESC);
