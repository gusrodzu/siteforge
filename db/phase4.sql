-- Phase 4: billing catalog / site plan assignments (no payment processing yet)
CREATE TABLE IF NOT EXISTS subscription_plans (
 code TEXT PRIMARY KEY, name TEXT NOT NULL, site_limit INTEGER NOT NULL,
 page_limit INTEGER NOT NULL, ai_generations_monthly INTEGER NOT NULL,
 price_mxn INTEGER NOT NULL CHECK (price_mxn >= 0), active BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO subscription_plans(code,name,site_limit,page_limit,ai_generations_monthly,price_mxn) VALUES
 ('starter','Starter',1,5,3,0),
 ('pro','Pro',5,50,40,299),
 ('business','Business',25,300,200,799)
ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name,site_limit=EXCLUDED.site_limit,page_limit=EXCLUDED.page_limit,ai_generations_monthly=EXCLUDED.ai_generations_monthly,price_mxn=EXCLUDED.price_mxn;
CREATE TABLE IF NOT EXISTS organization_billing (
 organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
 plan_code TEXT NOT NULL DEFAULT 'starter' REFERENCES subscription_plans(code),
 billing_status TEXT NOT NULL DEFAULT 'demo' CHECK (billing_status IN ('demo','active','past_due','canceled')),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO organization_billing(organization_id,plan_code,billing_status)
 SELECT id,'starter','demo' FROM organizations ON CONFLICT (organization_id) DO NOTHING;
CREATE TABLE IF NOT EXISTS ai_generation_events (
 id UUID PRIMARY KEY, organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
 site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
 generated_by UUID NOT NULL REFERENCES users(id),
 mode TEXT NOT NULL CHECK(mode IN ('guided','ai')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_generation_month ON ai_generation_events (organization_id,created_at);
