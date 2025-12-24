/**
 * AI Application Preset
 * AI-powered application with usage tracking and quotas
 */

import type { Preset } from '../modules/types';

export const aiAppPreset: Preset = {
  key: 'ai-app',
  name: 'AI Application',
  description: 'AI-powered app with Claude integration, usage tracking, and file uploads',

  modules: [
    'auth',
    'ai-features',
    'file-uploads',
    'audit-log',
    'landing',
  ],

  defaultConfig: {
    theme: 'dark',
    branding: {
      appName: 'AI Assistant',
      tagline: 'Powered by Claude',
    },
    ai: {
      provider: 'anthropic',
      defaultModel: 'claude-sonnet-4',
      maxTokens: 4096,
    },
    features: {
      usageTracking: true,
      quotaManagement: true,
      fileUploads: true,
      historyTracking: true,
    },
  },

  pages: [
    '/',
    '/login',
    '/signup',
    '/dashboard',
    '/ai',
    '/ai/history',
    '/files',
    '/audit-log',
    '/settings',
    '/profile',
  ],

  features: {
    multiTenancy: false,
    subscriptions: false,
    aiIntegration: true,
    usageMetrics: true,
  },
};
