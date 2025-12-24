/**
 * Feature Flags Source Strategy
 * Manages where feature flags are loaded from (env vs DB)
 * with automatic fallback to support both development and production modes
 */

import { createClient } from '@/lib/supabase/server';

export type FlagSource = 'env' | 'database' | 'default';

export interface ModuleFlag {
  key: string;
  enabled: boolean;
  config: Record<string, unknown>;
  source: FlagSource;
}

/**
 * Get the current project ID from context
 * This can come from:
 * - Cookie/session (for authenticated users)
 * - URL parameter (for specific project views)
 * - Team's default project (fallback)
 */
export async function getCurrentProjectId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // TODO: Implement project selection logic
    // For now, return null to use env-based flags
    // In production, this would:
    // 1. Check user's current project selection (session/cookie)
    // 2. Fall back to team's default project
    // 3. Fall back to most recently created project

    return null;
  } catch {
    return null;
  }
}

/**
 * Load module flags from environment variables
 */
function loadFlagsFromEnv(): ModuleFlag[] {
  const flags: ModuleFlag[] = [];

  // Get all NEXT_PUBLIC_MODULE_* environment variables
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_MODULE_')) {
      const moduleKey = key
        .replace('NEXT_PUBLIC_MODULE_', '')
        .toLowerCase()
        .replace(/_/g, '-');

      const enabled = process.env[key] === 'true';

      flags.push({
        key: moduleKey,
        enabled,
        config: {},
        source: 'env',
      });
    }
  });

  return flags;
}

/**
 * Load module flags from database for a specific project
 */
async function loadFlagsFromDatabase(projectId: string): Promise<ModuleFlag[]> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Table will be available after running migrations
    const { data, error } = await supabase
      .from('project_modules')
      .select('module_key, enabled, config')
      .eq('project_id', projectId)
      .eq('enabled', true);

    if (error) {
      console.error('Error loading flags from database:', error);
      return [];
    }

    return (
      (data as Array<{ module_key: string; enabled: boolean; config: unknown }> | null)?.map(
        row => ({
          key: row.module_key,
          enabled: row.enabled,
          config: (row.config as Record<string, unknown>) || {},
          source: 'database' as FlagSource,
        })
      ) || []
    );
  } catch (error) {
    console.error('Error loading flags from database:', error);
    return [];
  }
}

/**
 * Get default enabled modules
 * These are always available regardless of configuration
 */
function getDefaultFlags(): ModuleFlag[] {
  return [
    {
      key: 'auth',
      enabled: true,
      config: {},
      source: 'default',
    },
    {
      key: 'landing',
      enabled: true,
      config: {},
      source: 'default',
    },
  ];
}

/**
 * Load all module flags with automatic fallback strategy:
 * 1. Try to load from database (if project_id is available)
 * 2. Fall back to environment variables
 * 3. Fall back to default modules
 *
 * @returns Array of module flags with their source
 */
export async function loadModuleFlags(): Promise<ModuleFlag[]> {
  // Strategy 1: Try database if we have a project context
  const projectId = await getCurrentProjectId();

  if (projectId) {
    const dbFlags = await loadFlagsFromDatabase(projectId);

    // If we have flags from DB, use them
    if (dbFlags.length > 0) {
      console.log(`[FeatureFlags] Loaded ${dbFlags.length} modules from database (project: ${projectId})`);

      // Merge with defaults to ensure core modules are always available
      const defaults = getDefaultFlags();
      const merged = new Map<string, ModuleFlag>();

      // Add DB flags first
      dbFlags.forEach(flag => merged.set(flag.key, flag));

      // Add defaults for missing core modules
      defaults.forEach(flag => {
        if (!merged.has(flag.key)) {
          merged.set(flag.key, flag);
        }
      });

      return Array.from(merged.values());
    }
  }

  // Strategy 2: Fall back to environment variables
  const envFlags = loadFlagsFromEnv();

  if (envFlags.length > 0) {
    console.log(`[FeatureFlags] Loaded ${envFlags.length} modules from environment variables`);

    // Merge with defaults
    const defaults = getDefaultFlags();
    const merged = new Map<string, ModuleFlag>();

    envFlags.forEach(flag => merged.set(flag.key, flag));
    defaults.forEach(flag => {
      if (!merged.has(flag.key)) {
        merged.set(flag.key, flag);
      }
    });

    return Array.from(merged.values());
  }

  // Strategy 3: Fall back to defaults only
  console.log('[FeatureFlags] Using default modules only');
  return getDefaultFlags();
}

/**
 * Check if a specific module is enabled
 * Uses the same fallback strategy as loadModuleFlags
 */
export async function isModuleEnabledFromSource(moduleKey: string): Promise<boolean> {
  const flags = await loadModuleFlags();
  return flags.some(flag => flag.key === moduleKey && flag.enabled);
}

/**
 * Get module configuration
 * Uses the same fallback strategy as loadModuleFlags
 */
export async function getModuleConfigFromSource<T = Record<string, unknown>>(
  moduleKey: string
): Promise<T | null> {
  const flags = await loadModuleFlags();
  const flag = flags.find(f => f.key === moduleKey);

  if (!flag) {
    // Fall back to module registry default config
    const { getModule } = await import('@/lib/modules/registry');
    const moduleDef = getModule(moduleKey);
    return (moduleDef?.defaultConfig as T) || null;
  }

  // If flag exists but has no config, try registry default
  if (!flag.config || Object.keys(flag.config).length === 0) {
    const { getModule } = await import('@/lib/modules/registry');
    const moduleDef = getModule(moduleKey);
    return (moduleDef?.defaultConfig as T) || null;
  }

  return (flag.config as T) || null;
}
