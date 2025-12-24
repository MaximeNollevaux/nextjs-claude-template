/**
 * Presets - Main Export
 */

import { saasStarterPreset } from './saas-starter';
import { aiAppPreset } from './ai-app';
import { internalToolPreset } from './internal-tool';
import type { Preset } from '../modules/types';

export * from './saas-starter';
export * from './ai-app';
export * from './internal-tool';

export const PRESETS: Record<string, Preset> = {
  'saas-starter': saasStarterPreset,
  'ai-app': aiAppPreset,
  'internal-tool': internalToolPreset,
};

export function getPreset(key: string): Preset | undefined {
  return PRESETS[key];
}

export function getAllPresets(): Preset[] {
  return Object.values(PRESETS);
}
