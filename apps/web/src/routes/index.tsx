import React, { lazy, Suspense, useCallback } from 'react';
import { Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { GlobalSearch } from '@/components/global-search/GlobalSearch';
import { LoadingState } from '@/components/shared/LoadingState';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';

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

// Dynamic renderers
const DynamicEntityListLazy = lazy(() => import('@/features/dynamic/DynamicEntityList'));
const DynamicEntityFormLazy = lazy(() => import('@/features/dynamic/DynamicEntityForm'));

const SuspenseLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingState type="page" />}>{children}</Suspense>
);

/** Wrapper that checks for ?dynamic=true and renders the dynamic version instead */
const DynamicPage: React.FC<{
  entityKey: string;
  children: React.ReactNode;
}> = ({ entityKey, children }) => {
  const [searchParams] = useSearchParams();
  const isDynamic = searchParams.get('dynamic') === 'true';

  if (isDynamic) {
    return <DynamicEntityListLazy entityKey={entityKey} />;
  }

  return <>{children}</>;
};

/** Wrapper for form routes with ?dynamic=true support */
const DynamicFormPage: React.FC<{
  entityKey: string;
  children: React.ReactNode;
}> = ({ entityKey, children }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDynamic = searchParams.get('dynamic') === 'true';
  const mode = (searchParams.get('mode') as 'create' | 'edit') ?? 'create';

  const handleSubmit = useCallback(() => {
    navigate(`/${entityKey === 'line_of_business' ? 'lines-of-business' : entityKey + 's'}`);
  }, [navigate, entityKey]);

  if (isDynamic) {
    return (
      <DynamicEntityFormLazy
        entityKey={entityKey}
        mode={mode}
        onSubmit={handleSubmit}
      />
    );
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <GlobalSearch />
              <AppShell>
                <SuspenseLoader>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                  <Route path="/clients/*" element={<DynamicPage entityKey="client"><ClientsPage /></DynamicPage>} />
                  <Route path="/contacts/*" element={<DynamicPage entityKey="contact"><ContactsPage /></DynamicPage>} />
                  <Route path="/carriers/*" element={<DynamicPage entityKey="carrier"><CarriersPage /></DynamicPage>} />
                  <Route path="/lines-of-business/*" element={<DynamicPage entityKey="line_of_business"><LinesPage /></DynamicPage>} />
                  <Route path="/capacity/*" element={<DynamicFormPage entityKey="capacity"><CapacityPage /></DynamicFormPage>} />
                  <Route path="/submissions/*" element={<DynamicPage entityKey="submission"><SubmissionsPage /></DynamicPage>} />
                  <Route path="/placements/*" element={<PlacementsPage />} />
                  <Route path="/renewals/*" element={<RenewalsPage />} />
                  <Route path="/email/*" element={<DynamicPage entityKey="email"><EmailPage /></DynamicPage>} />
                  <Route path="/network/*" element={<NetworkPage />} />
                  <Route path="/sync/*" element={<SyncPage />} />
                  <Route path="/config/*" element={<ConfigPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                </SuspenseLoader>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};
