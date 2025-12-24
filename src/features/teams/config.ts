/**
 * Teams Module - Configuration
 */

export const TEAMS_CONFIG = {
  maxMembersPerTeam: 10,
  maxTeamsPerUser: 3,
  invitationExpiryDays: 7,
  allowPublicInvitations: false,
  requireEmailVerification: true,
  defaultRole: 'member' as const,
  roles: {
    owner: {
      label: 'Owner',
      permissions: ['*'],
    },
    admin: {
      label: 'Admin',
      permissions: ['manage_members', 'manage_settings', 'view_billing'],
    },
    member: {
      label: 'Member',
      permissions: ['view_team'],
    },
  },
} as const;
