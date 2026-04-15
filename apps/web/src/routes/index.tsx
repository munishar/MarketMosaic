import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { GlobalSearch } from '@/components/global-search/GlobalSearch';
import { LoadingState } from '@/components/shared/LoadingState';

// Lazy-loaded feature page stubs
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const ClientsPage = lazy(() => import('@/features/clients/ClientsPage'));
const ContactsPage = lazy(() => import('@/features/contacts/ContactsPage'));
const CarriersPage = lazy(() => import('@/features/carriers/CarriersPage'));
const LinesPage = lazy(() => import('@/features/lines/LinesPage'));
const CapacityPage = lazy(() => import('@/features/capacity/CapacityPage'));
const SubmissionsPage = lazy(() => import('@/features/submissions/SubmissionsPage'));
const PlacementsPage = lazy(() => import('@/features/placements/PlacementsPage'));
const RenewalsPage = lazy(() => import('@/features/renewals/RenewalsPage'));
const EmailPage = lazy(() => import('@/features/email/EmailPage'));
const NetworkPage = lazy(() => import('@/features/network/NetworkPage'));
const SyncPage = lazy(() => import('@/features/sync/SyncPage'));
const ConfigPage = lazy(() => import('@/features/config/ConfigPage'));

const SuspenseLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingState type="page" />}>{children}</Suspense>
);

export const AppRoutes: React.FC = () => {
  return (
    <>
      <GlobalSearch />
      <Routes>
        <Route
          path="/*"
          element={
            <AppShell>
              <SuspenseLoader>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/clients/*" element={<ClientsPage />} />
                  <Route path="/contacts/*" element={<ContactsPage />} />
                  <Route path="/carriers/*" element={<CarriersPage />} />
                  <Route path="/lines-of-business/*" element={<LinesPage />} />
                  <Route path="/capacity/*" element={<CapacityPage />} />
                  <Route path="/submissions/*" element={<SubmissionsPage />} />
                  <Route path="/placements/*" element={<PlacementsPage />} />
                  <Route path="/renewals/*" element={<RenewalsPage />} />
                  <Route path="/email/*" element={<EmailPage />} />
                  <Route path="/network/*" element={<NetworkPage />} />
                  <Route path="/sync/*" element={<SyncPage />} />
                  <Route path="/config/*" element={<ConfigPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </SuspenseLoader>
            </AppShell>
          }
        />
      </Routes>
    </>
  );
};
