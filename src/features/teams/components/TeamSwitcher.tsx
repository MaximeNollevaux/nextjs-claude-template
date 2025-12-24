'use client';

/**
 * Team Switcher Component
 * Dropdown to switch between user's teams
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Team } from '../types';

interface TeamSwitcherProps {
  teams: Team[];
  currentTeamId?: string;
  onTeamChange: (teamId: string) => void;
}

export function TeamSwitcher({ teams, currentTeamId, onTeamChange }: TeamSwitcherProps) {
  return (
    <Select value={currentTeamId} onValueChange={onTeamChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select team" />
      </SelectTrigger>
      <SelectContent>
        {teams.map(team => (
          <SelectItem key={team.id} value={team.id}>
            {team.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
