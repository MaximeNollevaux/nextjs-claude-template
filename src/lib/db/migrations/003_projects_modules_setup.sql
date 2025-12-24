-- =====================================================
-- Projects & Modules Management
-- =====================================================
-- This migration creates the infrastructure for project-level
-- module management with multi-tenant safety.

-- =====================================================
-- 1. Projects Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Multi-tenant support
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,

  -- Ownership
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metadata
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT projects_slug_unique UNIQUE (team_id, slug)
);

-- =====================================================
-- 2. Project Modules Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.project_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,

  -- Module state
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,

  -- Migration tracking
  applied_migrations TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_migration_at TIMESTAMPTZ,

  -- Metadata
  enabled_at TIMESTAMPTZ DEFAULT now(),
  enabled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT project_modules_unique UNIQUE (project_id, module_key)
);

-- =====================================================
-- 3. Module Migrations Log Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.module_migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  migration_file TEXT NOT NULL,

  -- Migration details
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed')),
  error_message TEXT,
  execution_time_ms INTEGER,

  -- Metadata
  applied_at TIMESTAMPTZ DEFAULT now(),
  applied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  CONSTRAINT module_migrations_unique UNIQUE (project_id, module_key, migration_file)
);

-- =====================================================
-- 4. Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON public.projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_modules_project_id ON public.project_modules(project_id);
CREATE INDEX IF NOT EXISTS idx_project_modules_enabled ON public.project_modules(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_module_migrations_project_id ON public.module_migrations(project_id);
CREATE INDEX IF NOT EXISTS idx_module_migrations_status ON public.module_migrations(status);

-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_migrations ENABLE ROW LEVEL SECURITY;

-- Projects RLS Policies
CREATE POLICY "Users can view projects in their teams"
  ON public.projects FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners/admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners/admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners can delete projects"
  ON public.projects FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Project Modules RLS Policies
CREATE POLICY "Users can view modules in their team's projects"
  ON public.project_modules FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      INNER JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners/admins can manage modules"
  ON public.project_modules FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      INNER JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- Module Migrations RLS Policies
CREATE POLICY "Users can view migration logs in their team's projects"
  ON public.module_migrations FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      INNER JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage migration logs"
  ON public.module_migrations FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      INNER JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- 6. Triggers for Updated At
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_modules_updated_at
  BEFORE UPDATE ON public.project_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. Helper Functions
-- =====================================================

-- Check if a module is enabled for a project
CREATE OR REPLACE FUNCTION public.is_module_enabled(
  p_project_id UUID,
  p_module_key TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.project_modules
    WHERE project_id = p_project_id
    AND module_key = p_module_key
    AND enabled = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get enabled modules for a project
CREATE OR REPLACE FUNCTION public.get_enabled_modules(p_project_id UUID)
RETURNS TABLE (
  module_key TEXT,
  config JSONB,
  enabled_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.module_key,
    pm.config,
    pm.enabled_at
  FROM public.project_modules pm
  WHERE pm.project_id = p_project_id
  AND pm.enabled = true
  ORDER BY pm.enabled_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable a module for a project
CREATE OR REPLACE FUNCTION public.enable_module(
  p_project_id UUID,
  p_module_key TEXT,
  p_config JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_module_id UUID;
BEGIN
  INSERT INTO public.project_modules (project_id, module_key, enabled, config, enabled_by)
  VALUES (p_project_id, p_module_key, true, p_config, auth.uid())
  ON CONFLICT (project_id, module_key)
  DO UPDATE SET
    enabled = true,
    config = EXCLUDED.config,
    enabled_at = now(),
    enabled_by = auth.uid(),
    updated_at = now()
  RETURNING id INTO v_module_id;

  RETURN v_module_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disable a module for a project
CREATE OR REPLACE FUNCTION public.disable_module(
  p_project_id UUID,
  p_module_key TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.project_modules
  SET enabled = false, updated_at = now()
  WHERE project_id = p_project_id
  AND module_key = p_module_key;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. Comments for Documentation
-- =====================================================
COMMENT ON TABLE public.projects IS 'Projects belong to teams and can have modules enabled';
COMMENT ON TABLE public.project_modules IS 'Tracks which modules are enabled for each project with configuration';
COMMENT ON TABLE public.module_migrations IS 'Logs all module migration executions for auditing';
COMMENT ON FUNCTION public.is_module_enabled IS 'Check if a specific module is enabled for a project';
COMMENT ON FUNCTION public.get_enabled_modules IS 'Get all enabled modules for a project with their config';
COMMENT ON FUNCTION public.enable_module IS 'Enable a module for a project (idempotent)';
COMMENT ON FUNCTION public.disable_module IS 'Disable a module for a project';
