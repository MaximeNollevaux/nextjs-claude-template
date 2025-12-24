/**
 * Internal Tool Preset
 * Lightweight internal tool with auth and basic features
 */

import type { Preset } from '../modules/types';

export const internalToolPreset: Preset = {
  key: 'internal-tool',
  name: 'Internal Tool',
  description: 'Simple internal tool with authentication and audit logging',

  modules: [
    'auth',
    'audit-log',
    'file-uploads',
  ],

  defaultConfig: {
    theme: 'light',
    branding: {
      appName: 'Internal Dashboard',
      tagline: 'Team productivity tool',
    },
    features: {
      emailVerification: false,
      publicSignup: false,
      auditLogging: true,
    },
  },

  pages: [
    '/login',
    '/dashboard',
    '/audit-log',
    '/files',
    '/settings',
    '/profile',
  ],

  features: {
    multiTenancy: false,
    subscriptions: false,
    publicAccess: false,
    adminOnly: true,
  },
};
