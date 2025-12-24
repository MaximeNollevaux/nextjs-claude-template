/**
 * Module System Types
 * Defines the structure and contracts for the SaaS Factory module system
 */

export interface ModuleDefinition {
  /** Unique module identifier */
  key: string;

  /** Human-readable module name */
  name: string;

  /** Module description */
  description: string;

  /** Required modules that must be enabled first */
  dependencies: string[];

  /** Routes that belong to this module */
  routes: string[];

  /** Database migration files */
  migrations: string[];

  /** Whether this is a premium/paid module */
  premium: boolean;

  /** Default configuration for this module */
  defaultConfig?: Record<string, unknown>;
}

export interface ModuleConfig {
  /** Module identifier */
  moduleKey: string;

  /** Whether the module is enabled */
  enabled: boolean;

  /** Module-specific configuration */
  config: Record<string, unknown>;
}

export interface Preset {
  /** Preset identifier */
  key: string;

  /** Human-readable preset name */
  name: string;

  /** Preset description */
  description: string;

  /** Modules to enable with this preset */
  modules: string[];

  /** Default configuration for the preset */
  defaultConfig?: Record<string, unknown>;

  /** Pages to include in the project */
  pages?: string[];

  /** Recommended features */
  features?: Record<string, boolean>;
}

export type ModuleRegistry = Record<string, ModuleDefinition>;
