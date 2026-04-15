import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { GlobalSearch } from '@/components/global-search/GlobalSearch';
import { LoadingState } from '@/components/shared/LoadingState';

// Lazy-loaded feature pages
const DashboardPage = lazy(() => import('@/features/dashboard/Dashboard'));
const ClientsPage = lazy(() => import('@/features/clients/ClientManager'));
const ContactsPage = lazy(() => import('@/features/contacts/ContactManager'));
const CarriersPage = lazy(() => import('@/features/carriers/CarrierManager'));
const LinesPage = lazy(() => import('@/features/lines/LineOfBusinessManager'));
const CapacityPage = lazy(() => import('@/features/capacity/CapacityMatrix'));
const SubmissionsPage = lazy(() => import('@/features/submissions/SubmissionManager'));
const PlacementsPage = lazy(() => import('@/features/placements/PlacementTracker'));
const RenewalsPage = lazy(() => import('@/features/renewals/RenewalCalendar'));
const EmailPage = lazy(() => import('@/features/email/EmailInbox'));
const NetworkPage = lazy(() => import('@/features/network/NetworkGraph'));
const SyncPage = lazy(() => import('@/features/sync/SyncDashboard'));
const ConfigPage = lazy(() => import('@/features/config/ConfigAdmin'));

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
