'use client';

/**
 * Modules Manager Component
 * Admin UI for managing enabled/disabled modules with impact analysis
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Package, RefreshCw } from 'lucide-react';
import type { ModuleDefinition } from '@/lib/modules/types';

interface ModulesManagerProps {
  allModules: ModuleDefinition[];
  initialEnabledModules: string[];
}

interface ModuleState {
  [key: string]: boolean;
}

export function ModulesManager({ allModules, initialEnabledModules }: ModulesManagerProps) {
  const [enabledModules, setEnabledModules] = useState<ModuleState>(() => {
    const state: ModuleState = {};
    allModules.forEach(mod => {
      state[mod.key] = initialEnabledModules.includes(mod.key);
    });
    return state;
  });

  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Calculate impact of enabling/disabling a module
  const getImpact = useMemo(() => {
    return (moduleKey: string, wouldBeEnabled: boolean) => {
      const impacts: { module: string; reason: string }[] = [];

      if (!wouldBeEnabled) {
        // Check which modules depend on this one
        allModules.forEach(mod => {
          if (mod.dependencies.includes(moduleKey) && enabledModules[mod.key]) {
            impacts.push({
              module: mod.name,
              reason: `Depends on ${allModules.find(m => m.key === moduleKey)?.name}`,
            });
          }
        });
      } else {
        // Check if dependencies are met
        const targetModule = allModules.find(m => m.key === moduleKey);
        if (targetModule) {
          targetModule.dependencies.forEach(dep => {
            if (!enabledModules[dep]) {
              impacts.push({
                module: allModules.find(m => m.key === dep)?.name || dep,
                reason: 'Required dependency (will be auto-enabled)',
              });
            }
          });
        }
      }

      return impacts;
    };
  }, [allModules, enabledModules]);

  // Handle toggle with dependency resolution
  const handleToggle = (moduleKey: string) => {
    const newValue = !enabledModules[moduleKey];
    const newState = { ...enabledModules };

    if (newValue) {
      // Enabling: auto-enable dependencies
      const moduleDef = allModules.find(m => m.key === moduleKey);
      if (moduleDef) {
        moduleDef.dependencies.forEach(dep => {
          newState[dep] = true;
        });
      }
      newState[moduleKey] = true;
    } else {
      // Disabling: auto-disable dependents
      newState[moduleKey] = false;
      allModules.forEach(mod => {
        if (mod.dependencies.includes(moduleKey) && newState[mod.key]) {
          newState[mod.key] = false;
        }
      });
    }

    setEnabledModules(newState);
    setMessage(null);
  };

  // Calculate changes
  const changes = useMemo(() => {
    const enabled: string[] = [];
    const disabled: string[] = [];

    Object.keys(enabledModules).forEach(key => {
      const wasEnabled = initialEnabledModules.includes(key);
      const isEnabled = enabledModules[key];

      if (!wasEnabled && isEnabled) enabled.push(key);
      if (wasEnabled && !isEnabled) disabled.push(key);
    });

    return { enabled, disabled, hasChanges: enabled.length > 0 || disabled.length > 0 };
  }, [enabledModules, initialEnabledModules]);

  // Apply changes (would trigger backend API or script)
  const handleApply = async () => {
    setIsApplying(true);
    setMessage(null);

    try {
      // In production, this would call an API endpoint
      // For now, we simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMessage({
        type: 'success',
        text: `Successfully applied changes! ${changes.enabled.length} enabled, ${changes.disabled.length} disabled. Run 'npm run modules:apply' to apply migrations.`,
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to apply changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Module Management</h2>
          <p className="text-gray-400 mt-1">
            Enable or disable modules for your project. Changes require database migrations.
          </p>
        </div>

        {changes.hasChanges && (
          <Button onClick={handleApply} disabled={isApplying} className="gap-2">
            {isApplying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Apply Changes ({changes.enabled.length + changes.disabled.length})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/50 text-green-300'
              : 'bg-red-500/10 border-red-500/50 text-red-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5" />
            )}
            <p className="flex-1">{message.text}</p>
          </div>
        </div>
      )}

      {/* Changes Summary */}
      {changes.hasChanges && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pending Changes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {changes.enabled.length > 0 && (
              <div>
                <p className="text-sm font-medium text-green-400 mb-2">
                  To Enable ({changes.enabled.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {changes.enabled.map(key => {
                    const mod = allModules.find(m => m.key === key);
                    return (
                      <Badge key={key} variant="outline" className="bg-green-500/10 border-green-500/50">
                        {mod?.name || key}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {changes.disabled.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-400 mb-2">To Disable ({changes.disabled.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {changes.disabled.map(key => {
                    const mod = allModules.find(m => m.key === key);
                    return (
                      <Badge key={key} variant="outline" className="bg-red-500/10 border-red-500/50">
                        {mod?.name || key}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modules List */}
      <div className="grid gap-4">
        {allModules.map(module => {
          const isEnabled = enabledModules[module.key];
          const impact = getImpact(module.key, !isEnabled);
          const hasChanged =
            changes.enabled.includes(module.key) || changes.disabled.includes(module.key);

          return (
            <Card key={module.key} className={hasChanged ? 'border-blue-500/50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      {module.premium && (
                        <Badge variant="outline" className="bg-purple-500/20 border-purple-500/50">
                          Premium
                        </Badge>
                      )}
                      {isEnabled && (
                        <Badge variant="outline" className="bg-green-500/20 border-green-500/50">
                          Enabled
                        </Badge>
                      )}
                      {hasChanged && (
                        <Badge variant="outline" className="bg-blue-500/20 border-blue-500/50">
                          Changed
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-2">{module.description}</CardDescription>
                  </div>

                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(module.key)}
                    disabled={module.key === 'auth'} // Auth module cannot be disabled
                  />
                </div>

                {/* Dependencies */}
                {module.dependencies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">Dependencies:</p>
                    <div className="flex flex-wrap gap-2">
                      {module.dependencies.map(dep => {
                        const depModule = allModules.find(m => m.key === dep);
                        const depEnabled = enabledModules[dep];
                        return (
                          <Badge
                            key={dep}
                            variant="outline"
                            className={
                              depEnabled
                                ? 'bg-green-500/10 border-green-500/50'
                                : 'bg-red-500/10 border-red-500/50'
                            }
                          >
                            {depModule?.name || dep}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Impact Analysis */}
                {impact.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm text-orange-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Impact ({impact.length}):
                    </p>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {impact.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-400">•</span>
                          <span>
                            <strong>{imp.module}</strong> - {imp.reason}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
