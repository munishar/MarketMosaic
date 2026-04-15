import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Contact,
  Building2,
  Layers,
  Grid3X3,
  Send,
  FileCheck,
  CalendarClock,
  Mail,
  Network,
  RefreshCw,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { usePermissions } from '@/lib/hooks/usePermissions';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Clients', path: '/clients', icon: <Users className="h-5 w-5" /> },
  { label: 'Contacts', path: '/contacts', icon: <Contact className="h-5 w-5" /> },
  { label: 'Carriers', path: '/carriers', icon: <Building2 className="h-5 w-5" /> },
  {
    label: 'Lines of Business',
    path: '/lines-of-business',
    icon: <Layers className="h-5 w-5" />,
  },
  {
    label: 'Capacity Matrix',
    path: '/capacity',
    icon: <Grid3X3 className="h-5 w-5" />,
  },
  {
    label: 'Submissions',
    path: '/submissions',
    icon: <Send className="h-5 w-5" />,
  },
  {
    label: 'Placements',
    path: '/placements',
    icon: <FileCheck className="h-5 w-5" />,
  },
  {
    label: 'Renewals',
    path: '/renewals',
    icon: <CalendarClock className="h-5 w-5" />,
  },
  { label: 'Email', path: '/email', icon: <Mail className="h-5 w-5" /> },
  { label: 'Network', path: '/network', icon: <Network className="h-5 w-5" /> },
  { label: 'Sync', path: '/sync', icon: <RefreshCw className="h-5 w-5" /> },
  {
    label: 'Config',
    path: '/config',
    icon: <Settings className="h-5 w-5" />,
    adminOnly: true,
  },
];

export const Sidebar: React.FC = () => {
  const collapsed = useAppStore((s) => s.ui.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { canAccessConfig } = usePermissions();
  const location = useLocation();

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || canAccessConfig,
  );

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-200 bg-white transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
            BF
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-primary">marketmosaic</span>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    collapsed && 'justify-center px-2',
                  )}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-gray-200 p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
};
