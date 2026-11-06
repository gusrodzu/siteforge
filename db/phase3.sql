-- Phase 3: invitations, media, domains, publish audit. Safe to rerun.
CREATE TABLE IF NOT EXISTS invitations (
 id UUID PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
 email TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('editor','viewer')),
 token_hash TEXT NOT NULL UNIQUE, invited_by UUID NOT NULL REFERENCES users(id),
 expires_at TIMESTAMPTZ NOT NULL, accepted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);
CREATE TABLE IF NOT EXISTS assets (
 id UUID PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
 site_id UUID NOT NULL, uploaded_by UUID NOT NULL REFERENCES users(id),
 original_name TEXT NOT NULL, storage_name TEXT NOT NULL UNIQUE,
 mime TEXT NOT NULL, byte_size INTEGER NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY (site_id, organization_id) REFERENCES sites(id, organization_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_assets_site ON assets(site_id);
CREATE TABLE IF NOT EXISTS site_domains (
 id UUID PRIMARY KEY, site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
 hostname TEXT NOT NULL UNIQUE, verification_token TEXT NOT NULL,
 verified_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS publication_events (
 id UUID PRIMARY KEY, page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
 published_by UUID NOT NULL REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
