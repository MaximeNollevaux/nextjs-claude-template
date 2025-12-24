/**
 * Feature Flags Types
 */

export interface FeatureFlag {
  id: string;
  moduleKey: string;
  enabled: boolean;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlagsContextValue {
  flags: Record<string, boolean>;
  config: Record<string, Record<string, unknown>>;
  isEnabled: (moduleKey: string) => boolean;
  getConfig: <T = Record<string, unknown>>(moduleKey: string) => T | null;
}
