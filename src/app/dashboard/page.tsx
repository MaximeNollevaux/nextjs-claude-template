'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-300">Welcome back, {user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg font-semibold transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="text-gray-400 text-sm font-medium mb-2">Total Users</div>
            <div className="text-3xl font-bold text-white">1,234</div>
            <div className="text-green-400 text-sm mt-2">↑ 12% from last month</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="text-gray-400 text-sm font-medium mb-2">Revenue</div>
            <div className="text-3xl font-bold text-white">$12,345</div>
            <div className="text-green-400 text-sm mt-2">↑ 8% from last month</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
            <div className="text-gray-400 text-sm font-medium mb-2">Active Now</div>
            <div className="text-3xl font-bold text-white">89</div>
            <div className="text-blue-400 text-sm mt-2">Real-time data</div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
          <div className="space-y-4 text-gray-300">
            <p>Welcome to your Next.js + Claude Code dashboard!</p>
            <p>This is a protected route. Only authenticated users can access this page.</p>

            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Quick Tips:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Claude Code can modify your database autonomously</li>
                <li>Use slash commands like /commit, /epct for faster development</li>
                <li>Dark mode and glass morphism design are enabled by default</li>
                <li>Authentication is handled by Supabase Auth</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
