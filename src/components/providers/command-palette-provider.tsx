'use client';

import { useState } from 'react';
import { CommandPalette } from '@/components/command-palette';

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children}
      <CommandPalette open={open} setOpen={setOpen} />
    </>
  );
}
