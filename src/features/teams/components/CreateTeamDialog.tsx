'use client';

/**
 * Create Team Dialog
 * Modal for creating a new team
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTeam: (name: string, slug?: string) => Promise<void>;
}

export function CreateTeamDialog({ open, onOpenChange, onCreateTeam }: CreateTeamDialogProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreateTeam(name, slug || undefined);
      setName('');
      setSlug('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a new team to collaborate with your colleagues
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Acme Inc."
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="slug">Team Slug (optional)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="acme-inc"
              className="mt-2"
            />
            <p className="text-sm text-gray-400 mt-1">
              Leave empty to auto-generate from team name
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
