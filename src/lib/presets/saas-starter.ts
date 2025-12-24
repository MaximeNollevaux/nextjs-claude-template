/**
 * SaaS Starter Preset
 * Complete SaaS application with teams, billing, and core features
 */

import type { Preset } from '../modules/types';

export const saasStarterPreset: Preset = {
  key: 'saas-starter',
  name: 'SaaS Starter',
  description: 'Complete SaaS with auth, teams, billing, and essential features',

  modules: [
    'auth',
    'teams',
    'billing',
    'emails',
    'audit-log',
    'landing',
  ],

  defaultConfig: {
    theme: 'dark',
    branding: {
      appName: 'My SaaS App',
      tagline: 'Build something amazing',
    },
    features: {
      emailVerification: true,
      teamInvitations: true,
      stripeIntegration: true,
      auditLogging: true,
    },
  },

  pages: [
    '/',
    '/pricing',
    '/features',
    '/login',
    '/signup',
    '/dashboard',
    '/teams',
    '/teams/:id',
    '/billing',
    '/audit-log',
    '/settings',
    '/profile',
  ],

  features: {
    multiTenancy: true,
    subscriptions: true,
    apiKeys: false,
    webhooks: false,
  },
};
