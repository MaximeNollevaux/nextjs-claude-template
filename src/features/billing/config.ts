/**
 * Billing Module Configuration
 */

export const BILLING_CONFIG = {
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  plans: {
    free: {
      name: 'Free',
      price: 0,
      interval: 'month' as const,
      features: ['auth', 'landing'],
      limits: {
        projects: 1,
        members: 3,
      },
    },
    pro: {
      name: 'Pro',
      price: 2900, // $29.00 in cents
      interval: 'month' as const,
      features: ['auth', 'teams', 'audit-log', 'landing'],
      limits: {
        projects: 10,
        members: 10,
      },
    },
    business: {
      name: 'Business',
      price: 9900, // $99.00 in cents
      interval: 'month' as const,
      features: ['auth', 'teams', 'billing', 'audit-log', 'file-uploads', 'emails', 'landing'],
      limits: {
        projects: 100,
        members: 50,
      },
    },
  },
  features: {
    'advanced-analytics': { requiresPlan: ['business'] },
    'api-access': { requiresPlan: ['pro', 'business'] },
    'priority-support': { requiresPlan: ['business'] },
  },
} as const;

export type PlanKey = keyof typeof BILLING_CONFIG.plans;
