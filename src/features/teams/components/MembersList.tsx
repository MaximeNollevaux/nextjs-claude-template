'use client';

/**
 * Members List Component
 * Display and manage team members
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamMember, TeamRole } from '../types';

interface MembersListProps {
  members: TeamMember[];
  currentUserId?: string;
  onUpdateRole?: (userId: string, role: TeamRole) => void;
  onRemoveMember?: (userId: string) => void;
}

export function MembersList({ members, currentUserId, onRemoveMember }: MembersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No members yet</p>
        ) : (
          <div className="space-y-3">
            {members.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {member.user?.fullName || member.user?.email}
                    {member.userId === currentUserId && (
                      <span className="ml-2 text-xs text-gray-400">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-400">{member.user?.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                    {member.role}
                  </span>

                  {member.userId !== currentUserId && onRemoveMember && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveMember(member.userId)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
