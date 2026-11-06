-- SiteForge v0.9: draft/published site-wide visual header and footer.
CREATE TABLE IF NOT EXISTS site_layouts (
 site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('header','footer')),
 draft JSONB NOT NULL DEFAULT '{"root":{},"content":[]}'::jsonb,
 published JSONB,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(site_id, kind)
);