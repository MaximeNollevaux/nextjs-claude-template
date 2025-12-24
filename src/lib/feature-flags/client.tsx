'use client';

/**
 * Feature Flags - Client Side
 * React hooks and components for feature flag checking
 */

import { createContext, useContext, useState } from 'react';
import type { FeatureFlagsContextValue } from './types';

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null);

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
  initialFlags?: Record<string, boolean>;
  initialConfig?: Record<string, Record<string, unknown>>;
}

export function FeatureFlagsProvider({
  children,
  initialFlags = {},
  initialConfig = {},
}: FeatureFlagsProviderProps) {
  const [flags] = useState<Record<string, boolean>>(initialFlags);
  const [config] = useState<Record<string, Record<string, unknown>>>(initialConfig);

  const isEnabled = (moduleKey: string): boolean => {
    return flags[moduleKey] ?? false;
  };

  const getConfig = <T = Record<string, unknown>>(moduleKey: string): T | null => {
    return (config[moduleKey] as T) || null;
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, config, isEnabled, getConfig }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * Hook to access feature flags
 */
export function useFeatureFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  }
  return context;
}

/**
 * Hook to check if a specific module is enabled
 */
export function useModuleEnabled(moduleKey: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(moduleKey);
}

/**
 * Hook to get module configuration
 */
export function useModuleConfig<T = Record<string, unknown>>(moduleKey: string): T | null {
  const { getConfig } = useFeatureFlags();
  return getConfig<T>(moduleKey);
}

/**
 * Component to conditionally render based on module enablement
 */
interface FeatureGateProps {
  module: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ module, children, fallback = null }: FeatureGateProps) {
  const enabled = useModuleEnabled(module);

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
