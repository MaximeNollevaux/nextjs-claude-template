/**
 * Module Registry
 * Central registry of all available modules in the SaaS Factory
 */

import type { ModuleDefinition, ModuleRegistry } from './types';

export const MODULE_REGISTRY: ModuleRegistry = {
  auth: {
    key: 'auth',
    name: 'Authentication',
    description: 'User authentication & authorization with Supabase',
    dependencies: [],
    routes: ['/login', '/signup', '/profile'],
    migrations: ['001_auth_setup.sql'],
    premium: false,
    defaultConfig: {
      emailVerification: true,
      passwordReset: true,
      socialAuth: false,
    },
  },

  teams: {
    key: 'teams',
    name: 'Teams & Workspaces',
    description: 'Multi-tenant team management and member invitations',
    dependencies: ['auth'],
    routes: ['/teams', '/teams/:id', '/teams/:id/settings', '/teams/:id/members'],
    migrations: ['002_teams_setup.sql'],
    premium: false,
    defaultConfig: {
      maxMembersPerTeam: 10,
      allowInvitations: true,
      roles: ['owner', 'admin', 'member'],
    },
  },

  billing: {
    key: 'billing',
    name: 'Stripe Billing',
    description: 'Subscription management and payments with Stripe',
    dependencies: ['auth', 'teams'],
    routes: ['/billing', '/billing/plans', '/billing/portal'],
    migrations: ['003_billing_setup.sql'],
    premium: true,
    defaultConfig: {
      provider: 'stripe',
      billingInterval: 'monthly',
      trialDays: 14,
    },
  },

  emails: {
    key: 'emails',
    name: 'Transactional Emails',
    description: 'Email notifications and transactional emails',
    dependencies: ['auth'],
    routes: [],
    migrations: ['004_email_templates.sql'],
    premium: false,
    defaultConfig: {
      provider: 'resend',
      fromEmail: 'noreply@example.com',
      fromName: 'Your App',
    },
  },

  'audit-log': {
    key: 'audit-log',
    name: 'Audit Log',
    description: 'Activity tracking and audit trail',
    dependencies: ['auth', 'teams'],
    routes: ['/audit-log'],
    migrations: ['005_audit_log_setup.sql'],
    premium: true,
    defaultConfig: {
      retentionDays: 90,
      trackEvents: ['user.login', 'user.logout', 'team.created', 'team.member.added'],
    },
  },

  'file-uploads': {
    key: 'file-uploads',
    name: 'File Uploads',
    description: 'File upload and storage management',
    dependencies: ['auth', 'teams'],
    routes: ['/files'],
    migrations: ['006_file_storage_setup.sql'],
    premium: false,
    defaultConfig: {
      maxFileSize: 10485760, // 10MB
      allowedTypes: ['image/png', 'image/jpeg', 'application/pdf'],
      storage: 'supabase',
    },
  },

  landing: {
    key: 'landing',
    name: 'Landing & Pricing Pages',
    description: 'Marketing landing page and pricing tables',
    dependencies: [],
    routes: ['/', '/pricing', '/features'],
    migrations: [],
    premium: false,
    defaultConfig: {
      showPricing: true,
      showTestimonials: true,
      showFAQ: true,
    },
  },

  'ai-features': {
    key: 'ai-features',
    name: 'AI Features',
    description: 'AI capabilities with usage tracking and quotas',
    dependencies: ['auth'],
    routes: ['/ai', '/ai/history'],
    migrations: ['007_ai_setup.sql'],
    premium: true,
    defaultConfig: {
      provider: 'anthropic',
      defaultModel: 'claude-sonnet-4',
      quotaPerMonth: 100,
    },
  },
};

/**
 * Get module definition by key
 */
export function getModule(key: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY[key];
}

/**
 * Get all module definitions
 */
export function getAllModules(): ModuleDefinition[] {
  return Object.values(MODULE_REGISTRY);
}

/**
 * Get modules with their dependencies resolved
 */
export function getModulesWithDependencies(moduleKeys: string[]): string[] {
  const resolved = new Set<string>();

  function resolveDependencies(key: string) {
    if (resolved.has(key)) return;

    const moduleDef = getModule(key);
    if (!moduleDef) return;

    // First resolve dependencies
    moduleDef.dependencies.forEach(dep => resolveDependencies(dep));

    // Then add this module
    resolved.add(key);
  }

  moduleKeys.forEach(key => resolveDependencies(key));

  return Array.from(resolved);
}

/**
 * Check if a module has all its dependencies enabled
 */
export function canEnableModule(
  moduleKey: string,
  enabledModules: string[]
): { canEnable: boolean; missingDependencies: string[] } {
  const moduleDef = getModule(moduleKey);
  if (!moduleDef) {
    return { canEnable: false, missingDependencies: [] };
  }

  const missingDependencies = moduleDef.dependencies.filter(
    dep => !enabledModules.includes(dep)
  );

  return {
    canEnable: missingDependencies.length === 0,
    missingDependencies,
  };
}
