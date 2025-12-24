/**
 * Billing Module Types
 * TypeScript definitions for Stripe integration
 */

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'paused';

export type PlanInterval = 'month' | 'year';

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';

export type LimitType = 'boolean' | 'quantity' | 'quota';

export type EventSource = 'stripe' | 'system' | 'manual';

export interface Subscription {
  id: string;
  teamId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  status: SubscriptionStatus;
  planName: string;
  planInterval: PlanInterval;
  amountCents: number;
  currency: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  canceledAt: Date | null;
  endedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionItem {
  id: string;
  subscriptionId: string;
  stripeSubscriptionItemId: string;
  stripePriceId: string;
  stripeProductId: string;
  quantity: number;
  amountCents: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Entitlement {
  id: string;
  teamId: string;
  subscriptionId: string | null;
  featureKey: string;
  featureName: string;
  enabled: boolean;
  limitType: LimitType | null;
  limitValue: number | null;
  usageValue: number;
  validFrom: Date | null;
  validUntil: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingEvent {
  id: string;
  teamId: string | null;
  subscriptionId: string | null;
  eventType: string;
  eventSource: EventSource;
  stripeEventId: string | null;
  stripeApiVersion: string | null;
  payload: Record<string, unknown> | null;
  processed: boolean;
  errorMessage: string | null;
  createdAt: Date;
  processedAt: Date | null;
}

export interface Invoice {
  id: string;
  teamId: string;
  subscriptionId: string | null;
  stripeInvoiceId: string;
  stripePaymentIntentId: string | null;
  status: InvoiceStatus;
  amountCents: number;
  amountPaidCents: number;
  currency: string;
  invoiceDate: Date | null;
  dueDate: Date | null;
  paidAt: Date | null;
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Input types for creating/updating

export interface CreateSubscriptionInput {
  teamId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  planName: string;
  planInterval: PlanInterval;
  amountCents: number;
  trialDays?: number;
}

export interface UpdateSubscriptionInput {
  stripePriceId?: string;
  planName?: string;
  planInterval?: PlanInterval;
  amountCents?: number;
  status?: SubscriptionStatus;
}

export interface CreateEntitlementInput {
  teamId: string;
  featureKey: string;
  featureName: string;
  limitType?: LimitType;
  limitValue?: number;
  validUntil?: Date;
}

// Stripe webhook event types
export type StripeWebhookEvent =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'customer.subscription.trial_will_end'
  | 'invoice.created'
  | 'invoice.finalized'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'checkout.session.completed'
  | 'checkout.session.expired';
