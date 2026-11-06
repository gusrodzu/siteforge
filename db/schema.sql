CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS memberships (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('owner','editor','viewer')),
  PRIMARY KEY(user_id,organization_id)
);
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL, slug TEXT NOT NULL, theme JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id,slug), UNIQUE(id,organization_id)
);
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY, site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  slug TEXT NOT NULL, title TEXT NOT NULL, draft JSONB NOT NULL DEFAULT '{"content":[],"root":{}}'::jsonb,
  published JSONB, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id,slug)
);
CREATE INDEX IF NOT EXISTS idx_sites_org ON sites(organization_id);
CREATE INDEX IF NOT EXISTS idx_pages_site ON pages(site_id);
