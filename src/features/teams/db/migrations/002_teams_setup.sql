-- Teams Module Migration
-- Creates tables for multi-tenant team management

-- Teams/Organizations table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON public.teams(created_by);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);

-- Row Level Security (RLS) Policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Teams: Users can only see teams they are members of
CREATE POLICY "Users can view their teams"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

-- Teams: Users can create teams
CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Teams: Only owners can update teams
CREATE POLICY "Owners can update teams"
  ON public.teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Team Members: Members can view other members
CREATE POLICY "Members can view team members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

-- Team Members: Admins and owners can add members
CREATE POLICY "Admins can add members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_members.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Team Members: Admins and owners can remove members
CREATE POLICY "Admins can remove members"
  ON public.team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- Team Invitations: Members can view invitations
CREATE POLICY "Members can view invitations"
  ON public.team_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Team Invitations: Admins can create invitations
CREATE POLICY "Admins can create invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Function to automatically add creator as owner
CREATE OR REPLACE FUNCTION public.add_team_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add creator as owner
DROP TRIGGER IF EXISTS on_team_created ON public.teams;
CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.add_team_creator_as_owner();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update teams.updated_at
DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
