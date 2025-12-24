-- =====================================================
-- Billing Module - Stripe Integration
-- =====================================================
-- Multi-tenant safe subscriptions and entitlements system

-- =====================================================
-- 1. Subscriptions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant support
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_product_id TEXT,

  -- Subscription details
  status TEXT NOT NULL CHECK (status IN (
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
    'paused'
  )),
  plan_name TEXT NOT NULL,
  plan_interval TEXT NOT NULL CHECK (plan_interval IN ('month', 'year')),

  -- Pricing
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',

  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT subscriptions_team_unique UNIQUE (team_id),
  CONSTRAINT subscriptions_stripe_customer_unique UNIQUE (stripe_customer_id),
  CONSTRAINT subscriptions_stripe_subscription_unique UNIQUE (stripe_subscription_id)
);

-- =====================================================
-- 2. Subscription Items Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_subscription_item_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL,
  stripe_product_id TEXT NOT NULL,

  -- Item details
  quantity INTEGER NOT NULL DEFAULT 1,
  amount_cents INTEGER NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. Entitlements Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,

  -- Entitlement details
  feature_key TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,

  -- Limits (null = unlimited)
  limit_type TEXT CHECK (limit_type IN ('boolean', 'quantity', 'quota')),
  limit_value INTEGER,
  usage_value INTEGER DEFAULT 0,

  -- Dates
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT entitlements_team_feature_unique UNIQUE (team_id, feature_key)
);

-- =====================================================
-- 4. Billing Events Log
-- =====================================================
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,

  -- Event details
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL DEFAULT 'stripe' CHECK (event_source IN ('stripe', 'system', 'manual')),

  -- Stripe webhook data
  stripe_event_id TEXT,
  stripe_api_version TEXT,

  -- Event payload
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- =====================================================
-- 5. Invoices Table (optional, for record-keeping)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,

  -- Stripe IDs
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,

  -- Invoice details
  status TEXT NOT NULL CHECK (status IN (
    'draft',
    'open',
    'paid',
    'uncollectible',
    'void'
  )),
  amount_cents INTEGER NOT NULL,
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',

  -- Dates
  invoice_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Links
  hosted_invoice_url TEXT,
  invoice_pdf_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 6. Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_team_id ON public.subscriptions(team_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_items_subscription_id ON public.subscription_items(subscription_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_team_id ON public.entitlements(team_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_feature_key ON public.entitlements(feature_key);
CREATE INDEX IF NOT EXISTS idx_billing_events_team_id ON public.billing_events(team_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_processed ON public.billing_events(processed) WHERE NOT processed;
CREATE INDEX IF NOT EXISTS idx_invoices_team_id ON public.invoices(team_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id);

-- =====================================================
-- 7. Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Subscriptions RLS
CREATE POLICY "Users can view their team's subscription"
  ON public.subscriptions FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners/admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Subscription Items RLS
CREATE POLICY "Users can view their team's subscription items"
  ON public.subscription_items FOR SELECT
  USING (
    subscription_id IN (
      SELECT s.id FROM public.subscriptions s
      INNER JOIN public.team_members tm ON s.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Entitlements RLS
CREATE POLICY "Users can view their team's entitlements"
  ON public.entitlements FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage entitlements"
  ON public.entitlements FOR ALL
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Billing Events RLS (read-only for users, write for system)
CREATE POLICY "Users can view their team's billing events"
  ON public.billing_events FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- Invoices RLS
CREATE POLICY "Users can view their team's invoices"
  ON public.invoices FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 8. Triggers
-- =====================================================

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_items_updated_at
  BEFORE UPDATE ON public.subscription_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entitlements_updated_at
  BEFORE UPDATE ON public.entitlements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 9. Helper Functions
-- =====================================================

-- Check if a team has an active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE team_id = p_team_id
    AND status IN ('active', 'trialing')
    AND (current_period_end IS NULL OR current_period_end > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if a feature is entitled for a team
CREATE OR REPLACE FUNCTION public.has_feature_entitlement(
  p_team_id UUID,
  p_feature_key TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.entitlements
    WHERE team_id = p_team_id
    AND feature_key = p_feature_key
    AND enabled = true
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_until IS NULL OR valid_until > now())
    AND (limit_type IS NULL OR limit_type = 'boolean' OR usage_value < limit_value)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment feature usage
CREATE OR REPLACE FUNCTION public.increment_feature_usage(
  p_team_id UUID,
  p_feature_key TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_entitlement RECORD;
BEGIN
  SELECT * INTO v_entitlement
  FROM public.entitlements
  WHERE team_id = p_team_id
  AND feature_key = p_feature_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if we're within limits
  IF v_entitlement.limit_type IN ('quantity', 'quota') THEN
    IF v_entitlement.usage_value + p_increment > v_entitlement.limit_value THEN
      RETURN false;
    END IF;
  END IF;

  -- Increment usage
  UPDATE public.entitlements
  SET usage_value = usage_value + p_increment,
      updated_at = now()
  WHERE id = v_entitlement.id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. Comments for Documentation
-- =====================================================
COMMENT ON TABLE public.subscriptions IS 'Stripe subscriptions for teams (one subscription per team)';
COMMENT ON TABLE public.subscription_items IS 'Individual items within a subscription';
COMMENT ON TABLE public.entitlements IS 'Feature entitlements and usage tracking for teams';
COMMENT ON TABLE public.billing_events IS 'Log of all billing-related events (webhooks, system events)';
COMMENT ON TABLE public.invoices IS 'Invoice records from Stripe';
COMMENT ON FUNCTION public.has_active_subscription IS 'Check if a team has an active or trialing subscription';
COMMENT ON FUNCTION public.has_feature_entitlement IS 'Check if a team is entitled to a specific feature';
COMMENT ON FUNCTION public.increment_feature_usage IS 'Increment usage counter for a feature (respects limits)';
