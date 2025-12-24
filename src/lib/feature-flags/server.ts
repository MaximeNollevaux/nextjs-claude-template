/**
 * Feature Flags - Server Side
 * Server-side utilities for checking module enablement
 *
 * This file provides a unified API that works with both:
 * - Environment variables (development/simple deployments)
 * - Database flags (production/multi-project setups)
 *
 * The system automatically falls back from DB → Env → Defaults
 */

import { createClient } from '@/lib/supabase/server';
import {
  loadModuleFlags,
  isModuleEnabledFromSource,
  getModuleConfigFromSource,
  getCurrentProjectId,
} from './source';

/**
 * Check if a module is enabled
 * Uses automatic fallback: DB → Env → Defaults
 *
 * @param moduleKey - The module to check
 * @returns True if the module is enabled
 */
export async function isModuleEnabled(moduleKey: string): Promise<boolean> {
  try {
    return await isModuleEnabledFromSource(moduleKey);
  } catch (error) {
    console.error(`Error checking module ${moduleKey}:`, error);
    return false;
  }
}

/**
 * Get module configuration
 * Uses automatic fallback: DB → Env → Module Registry
 *
 * @param moduleKey - The module to get config for
 * @returns The module configuration or null
 */
export async function getModuleConfig<T = Record<string, unknown>>(
  moduleKey: string
): Promise<T | null> {
  try {
    return await getModuleConfigFromSource<T>(moduleKey);
  } catch (error) {
    console.error(`Error getting config for ${moduleKey}:`, error);
    return null;
  }
}

/**
 * Get all enabled modules
 * Uses automatic fallback: DB → Env → Defaults
 *
 * @returns Array of enabled module keys
 */
export async function getEnabledModules(): Promise<string[]> {
  try {
    const flags = await loadModuleFlags();
    return flags.filter(f => f.enabled).map(f => f.key);
  } catch (error) {
    console.error('Error getting enabled modules:', error);
    return ['auth', 'landing']; // Fallback to defaults
  }
}

/**
 * Get detailed module flags with source information
 * Useful for debugging and admin UI
 *
 * @returns Array of module flags with metadata
 */
export async function getModuleFlagsWithSource() {
  try {
    return await loadModuleFlags();
  } catch (error) {
    console.error('Error getting module flags:', error);
    return [];
  }
}

/**
 * Enable a module for the current project
 * If no project context exists, logs a warning
 *
 * @param moduleKey - The module to enable
 * @param config - Optional configuration for the module
 * @returns The project_module record ID if successful
 */
export async function enableModule(
  moduleKey: string,
  config?: Record<string, unknown>
): Promise<string | null> {
  try {
    const projectId = await getCurrentProjectId();

    if (!projectId) {
      console.warn(
        `Cannot enable module ${moduleKey}: No project context. ` +
          'Use environment variables for development, or select a project.'
      );
      return null;
    }

    const supabase = await createClient();

    // Use the database function to enable the module
    // @ts-expect-error - RPC function will be available after running migrations
    const { data, error } = await supabase.rpc('enable_module', {
      p_project_id: projectId,
      p_module_key: moduleKey,
      p_config: config || {},
    });

    if (error) {
      console.error(`Error enabling module ${moduleKey}:`, error);
      throw error;
    }

    console.log(`Module ${moduleKey} enabled for project ${projectId}`);
    return data as string;
  } catch (error) {
    console.error(`Error enabling module ${moduleKey}:`, error);
    throw error;
  }
}

/**
 * Disable a module for the current project
 * If no project context exists, logs a warning
 *
 * @param moduleKey - The module to disable
 * @returns True if successful
 */
export async function disableModule(moduleKey: string): Promise<boolean> {
  try {
    const projectId = await getCurrentProjectId();

    if (!projectId) {
      console.warn(
        `Cannot disable module ${moduleKey}: No project context. ` +
          'Use environment variables for development, or select a project.'
      );
      return false;
    }

    const supabase = await createClient();

    // Use the database function to disable the module
    // @ts-expect-error - RPC function will be available after running migrations
    const { data, error } = await supabase.rpc('disable_module', {
      p_project_id: projectId,
      p_module_key: moduleKey,
    });

    if (error) {
      console.error(`Error disabling module ${moduleKey}:`, error);
      throw error;
    }

    console.log(`Module ${moduleKey} disabled for project ${projectId}`);
    return data as boolean;
  } catch (error) {
    console.error(`Error disabling module ${moduleKey}:`, error);
    throw error;
  }
}

/**
 * Enable a module for a specific project (admin/system use)
 *
 * @param projectId - The project ID
 * @param moduleKey - The module to enable
 * @param config - Optional configuration
 * @returns The project_module record ID
 */
export async function enableModuleForProject(
  projectId: string,
  moduleKey: string,
  config?: Record<string, unknown>
): Promise<string | null> {
  try {
    const supabase = await createClient();

    // @ts-expect-error - RPC function will be available after running migrations
    const { data, error } = await supabase.rpc('enable_module', {
      p_project_id: projectId,
      p_module_key: moduleKey,
      p_config: config || {},
    });

    if (error) {
      console.error(`Error enabling module ${moduleKey} for project ${projectId}:`, error);
      throw error;
    }

    return data as string;
  } catch (error) {
    console.error(`Error enabling module ${moduleKey} for project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Disable a module for a specific project (admin/system use)
 *
 * @param projectId - The project ID
 * @param moduleKey - The module to disable
 * @returns True if successful
 */
export async function disableModuleForProject(
  projectId: string,
  moduleKey: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // @ts-expect-error - RPC function will be available after running migrations
    const { data, error } = await supabase.rpc('disable_module', {
      p_project_id: projectId,
      p_module_key: moduleKey,
    });

    if (error) {
      console.error(`Error disabling module ${moduleKey} for project ${projectId}:`, error);
      throw error;
    }

    return data as boolean;
  } catch (error) {
    console.error(`Error disabling module ${moduleKey} for project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Get all enabled modules for a specific project
 *
 * @param projectId - The project ID
 * @returns Array of enabled module keys
 */
export async function getEnabledModulesForProject(projectId: string): Promise<string[]> {
  try {
    const supabase = await createClient();

    // @ts-expect-error - RPC function will be available after running migrations
    const { data, error } = await supabase.rpc('get_enabled_modules', {
      p_project_id: projectId,
    });

    if (error) {
      console.error(`Error getting enabled modules for project ${projectId}:`, error);
      return [];
    }

    return (data as Array<{ module_key: string }>)?.map(row => row.module_key) || [];
  } catch (error) {
    console.error(`Error getting enabled modules for project ${projectId}:`, error);
    return [];
  }
}
