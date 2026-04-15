import React from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIPanelSlot } from './AIPanelSlot';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const sidebarCollapsed = useAppStore((s) => s.ui.sidebarCollapsed);
  const aiPanelOpen = useAppStore((s) => s.ui.aiPanelOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />

      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-200',
          sidebarCollapsed ? 'ml-16' : 'ml-60',
        )}
      >
        <Header />

        <main className="flex-1 overflow-auto p-6">
          <div className={cn('transition-all duration-200', aiPanelOpen && 'mr-80')}>
            {children}
          </div>
        </main>
      </div>

      <AIPanelSlot />
    </div>
  );
};
