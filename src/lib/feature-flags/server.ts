/**
 * Feature Flags - Server Side
 * Server-side utilities for checking module enablement
 */

/**
 * Check if a module is enabled
 * @param moduleKey - The module to check
 * @returns True if the module is enabled
 */
export async function isModuleEnabled(moduleKey: string): Promise<boolean> {
  try {
    // For now, check environment variable or default config
    // In a real app, this would query the project_modules table
    const envKey = `NEXT_PUBLIC_MODULE_${moduleKey.toUpperCase().replace(/-/g, '_')}`;
    const envValue = process.env[envKey];

    if (envValue !== undefined) {
      return envValue === 'true';
    }

    // Default enabled modules (for template setup)
    const defaultEnabled = ['auth', 'landing'];
    return defaultEnabled.includes(moduleKey);
  } catch (error) {
    console.error(`Error checking module ${moduleKey}:`, error);
    return false;
  }
}

/**
 * Get module configuration
 * @param moduleKey - The module to get config for
 * @returns The module configuration or null
 */
export async function getModuleConfig<T = Record<string, unknown>>(
  moduleKey: string
): Promise<T | null> {
  try {
    // For now, return default config from module registry
    // In a real app, this would query the project_modules table
    const { getModule } = await import('@/lib/modules/registry');
    const moduleDef = getModule(moduleKey);

    return (moduleDef?.defaultConfig as T) || null;
  } catch (error) {
    console.error(`Error getting config for ${moduleKey}:`, error);
    return null;
  }
}

/**
 * Get all enabled modules
 * @returns Array of enabled module keys
 */
export async function getEnabledModules(): Promise<string[]> {
  try {
    const { getAllModules } = await import('@/lib/modules/registry');
    const allModules = getAllModules();

    const enabledChecks = await Promise.all(
      allModules.map(async module => ({
        key: module.key,
        enabled: await isModuleEnabled(module.key),
      }))
    );

    return enabledChecks.filter(m => m.enabled).map(m => m.key);
  } catch (error) {
    console.error('Error getting enabled modules:', error);
    return ['auth', 'landing']; // Fallback to defaults
  }
}

/**
 * Enable a module
 * @param moduleKey - The module to enable
 * @param config - Optional configuration for the module
 */
export async function enableModule(
  moduleKey: string,
  config?: Record<string, unknown>
): Promise<void> {
  try {
    // TODO: Implement database write when project_modules table is created
    // const supabase = await createClient();
    console.log(`Module ${moduleKey} would be enabled with config:`, config);
  } catch (error) {
    console.error(`Error enabling module ${moduleKey}:`, error);
    throw error;
  }
}

/**
 * Disable a module
 * @param moduleKey - The module to disable
 */
export async function disableModule(moduleKey: string): Promise<void> {
  try {
    // TODO: Implement database write when project_modules table is created
    // const supabase = await createClient();
    console.log(`Module ${moduleKey} would be disabled`);
  } catch (error) {
    console.error(`Error disabling module ${moduleKey}:`, error);
    throw error;
  }
}
