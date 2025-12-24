/**
 * Modules Settings Page
 * Admin interface for managing enabled/disabled modules
 */

import { getAllModules } from '@/lib/modules/registry';
import { getEnabledModules } from '@/lib/feature-flags/server';
import { ModulesManager } from './ModulesManager';

export default async function ModulesPage() {
  // Load all available modules from registry
  const allModules = getAllModules();

  // Load currently enabled modules
  const enabledModuleKeys = await getEnabledModules();

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <ModulesManager allModules={allModules} initialEnabledModules={enabledModuleKeys} />
    </div>
  );
}
