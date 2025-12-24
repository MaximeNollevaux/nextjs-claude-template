'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Home, User, Settings, LogOut, FileText } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils/cn';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const router = useRouter();
  const { signOut, isAuthenticated } = useAuth();

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[20%] w-full max-w-2xl translate-x-[-50%] px-4">
        <Command
          className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"
          label="Command Menu"
        >
          <div className="flex items-center border-b border-white/10 px-4">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-12 w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-gray-400"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-400">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="mb-2">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/'))}
                icon={<Home className="h-4 w-4" />}
              >
                Home
              </CommandItem>

              {isAuthenticated && (
                <>
                  <CommandItem
                    onSelect={() => runCommand(() => router.push('/dashboard'))}
                    icon={<FileText className="h-4 w-4" />}
                  >
                    Dashboard
                  </CommandItem>

                  <CommandItem
                    onSelect={() => runCommand(() => router.push('/profile'))}
                    icon={<User className="h-4 w-4" />}
                  >
                    Profile
                  </CommandItem>

                  <CommandItem
                    onSelect={() => runCommand(() => router.push('/settings'))}
                    icon={<Settings className="h-4 w-4" />}
                  >
                    Settings
                  </CommandItem>
                </>
              )}
            </Command.Group>

            {isAuthenticated && (
              <Command.Group heading="Account">
                <CommandItem
                  onSelect={() => runCommand(() => signOut())}
                  icon={<LogOut className="h-4 w-4" />}
                  className="text-red-400"
                >
                  Sign Out
                </CommandItem>
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t border-white/10 px-4 py-3 text-xs text-gray-400">
            Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white">⌘K</kbd> to toggle
          </div>
        </Command>
      </div>

      <div className="fixed inset-0" onClick={() => setOpen(false)} />
    </div>
  );
}

interface CommandItemProps {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ReactNode;
  className?: string;
}

function CommandItem({ children, onSelect, icon, className }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-200',
        'hover:bg-white/10 data-[selected=true]:bg-white/10',
        'transition-colors',
        className
      )}
    >
      {icon}
      {children}
    </Command.Item>
  );
}
