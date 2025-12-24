/**
 * Teams Module - Types
 */

export type TeamRole = 'owner' | 'admin' | 'member';

export interface Team {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  user?: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export interface CreateTeamInput {
  name: string;
  slug?: string;
}

export interface InviteMemberInput {
  teamId: string;
  email: string;
  role: TeamRole;
}

export interface UpdateMemberRoleInput {
  teamId: string;
  userId: string;
  role: TeamRole;
}
