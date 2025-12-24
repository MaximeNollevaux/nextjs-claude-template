'use client';

/**
 * Dynamic Navigation
 * Navigation that adapts based on enabled modules
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFeatureFlags } from '@/lib/feature-flags';
import { Home, Users, CreditCard, FileText, Settings, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  module?: string;
  always?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    always: true,
  },
  {
    key: 'teams',
    label: 'Teams',
    href: '/teams',
    icon: Users,
    module: 'teams',
  },
  {
    key: 'billing',
    label: 'Billing',
    href: '/billing',
    icon: CreditCard,
    module: 'billing',
  },
  {
    key: 'ai',
    label: 'AI Features',
    href: '/ai',
    icon: Zap,
    module: 'ai-features',
  },
  {
    key: 'audit',
    label: 'Audit Log',
    href: '/audit-log',
    icon: FileText,
    module: 'audit-log',
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: User,
    always: true,
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    always: true,
  },
];

export function DynamicNavigation() {
  const pathname = usePathname();
  const { isEnabled } = useFeatureFlags();

  const visibleItems = NAV_ITEMS.filter(
    item => item.always || (item.module && isEnabled(item.module))
  );

  return (
    <nav className="space-y-1">
      {visibleItems.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
