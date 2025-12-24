'use client';

/**
 * Sidebar Component
 * Main sidebar with dynamic navigation
 */

import { DynamicNavigation } from './DynamicNavigation';
import { useAuth } from '@/lib/hooks/useAuth';

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-white/5 backdrop-blur-lg border-r border-white/10 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">SaaS App</h1>
        {user && (
          <p className="text-sm text-gray-400 mt-1">{user.email}</p>
        )}
      </div>

      <DynamicNavigation />
    </aside>
  );
}
