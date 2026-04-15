import React, { useMemo, useState } from 'react';
import type { NavigationItem } from '@marketmosaic/manifest';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { useManifest } from './hooks/useManifest';
import type { ManifestOverrides } from './hooks/useManifest';

export interface DynamicNavigationProps {
  activePath?: string;
  onNavigate?: (path: string) => void;
  overrides?: ManifestOverrides;
}

type IconComponent = React.FC<{ className?: string }>;

function getIcon(iconName: string): IconComponent {
  const icons = LucideIcons as unknown as Record<string, IconComponent>;
  return icons[iconName] ?? LucideIcons.Circle;
}

/**
 * Config-driven sidebar navigation with role-based visibility and nested items.
 */
export const DynamicNavigation: React.FC<DynamicNavigationProps> = ({
  activePath,
  onNavigate,
  overrides,
}) => {
  const { navigation } = useManifest(overrides);
  const user = useAppStore((state) => state.auth.user);
  const userRole = user?.role ?? 'viewer';

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Filter by role and organize into tree
  const { topLevel, childrenMap } = useMemo(() => {
    const visibleItems = navigation.items
      .filter((item) => {
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(userRole);
      })
      .sort((a, b) => a.order - b.order);

    const top: NavigationItem[] = [];
    const children = new Map<string, NavigationItem[]>();

    visibleItems.forEach((item) => {
      if (item.parent_key) {
        const existing = children.get(item.parent_key) ?? [];
        existing.push(item);
        children.set(item.parent_key, existing);
      } else {
        top.push(item);
      }
    });

    return { topLevel: top, childrenMap: children };
  }, [navigation.items, userRole]);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderItem = (item: NavigationItem) => {
    const Icon = getIcon(item.icon);
    const children = childrenMap.get(item.key);
    const hasChildren = children && children.length > 0;
    const isExpanded = expandedKeys.has(item.key);
    const isActive = activePath === item.path;

    return (
      <li key={item.key}>
        <button
          type="button"
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.key);
            }
            onNavigate?.(item.path);
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
            isActive
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-gray-700 hover:bg-gray-100',
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {hasChildren && (
            isExpanded
              ? <ChevronDown className="h-4 w-4 text-gray-400" />
              : <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {/* Nested children */}
        {hasChildren && isExpanded && (
          <ul className="ml-4 mt-1 space-y-1">
            {children.map((child) => {
              const ChildIcon = getIcon(child.icon);
              const childActive = activePath === child.path;

              return (
                <li key={child.key}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(child.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-1.5 text-sm rounded-md transition-colors',
                      childActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    <ChildIcon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="flex-1 text-left">{child.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className="space-y-1" aria-label="Dynamic navigation">
      <ul className="space-y-1">{topLevel.map(renderItem)}</ul>
    </nav>
  );
};

export default DynamicNavigation;
